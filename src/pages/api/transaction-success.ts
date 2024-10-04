import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { getUser } from '../../../auth.config';
import { query } from '@/util/db';
import { explorerBaseURL } from '../../../const/contracts';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Function to parse the incoming form data using formidable
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10 MB limit
      uploadDir: os.tmpdir(), // Use the OS temporary directory
      keepExtensions: true, // Keep file extensions
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Function to extract field value as string
const getFieldValue = (field: string | string[]): string => {
  if (Array.isArray(field)) {
    return field[0];
  } else {
    return field;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: `Метод '${req.method}' не разрешен` });
    return;
  }

  try {
    // Authenticate the user
    const user = await getUser(req);
    if (!user || !user.address) {
      return res.status(401).json({ error: 'Неавторизованный доступ.' });
    }

    // Parse the form data
    const { fields, files } = await parseForm(req);

    // Debugging
    console.log('Fields received:', fields);
    console.log('Files received:', files);

    // Extract form fields
    const sender = getFieldValue(fields.sender);
    const tokenAddress = getFieldValue(fields.tokenAddress);
    const amount = getFieldValue(fields.amount);
    const bankName = getFieldValue(fields.bankName);
    const bik = getFieldValue(fields.bik);
    const accountNumber = getFieldValue(fields.accountNumber);
    const swiftCode = getFieldValue(fields.swiftCode);
    const iban = getFieldValue(fields.iban);
    const symbol = getFieldValue(fields.symbol);
    const txHash = getFieldValue(fields.txHash);
    const country = getFieldValue(fields.country);
    const paymentPurpose = getFieldValue(fields.paymentPurpose);

    // Validate required fields
    if (
      !sender ||
      !tokenAddress ||
      !amount ||
      !symbol ||
      !txHash ||
      !country ||
      !paymentPurpose
    ) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены.' });
    }

    const documentFile = files.document;
    const docFile = Array.isArray(documentFile) ? documentFile[0] : documentFile;

    let documentIpfsLink = '';
    if (docFile) {
      console.log('docFile:', docFile);
      console.log('docFile.filepath:', docFile.filepath);

      if (docFile.filepath) {
        // Upload document to IPFS via Thirdweb SDK
        const sdk = ThirdwebSDK.fromPrivateKey(
          process.env.THIRDWEB_AUTH_PRIVATE_KEY as string,
          'polygon',
          { secretKey: process.env.TW_SECRET_KEY }
        );

        try {
          const fileData = await fs.promises.readFile(docFile.filepath);
          const uploadResult = await sdk.storage.upload({
            data: fileData,
            name: docFile.originalFilename || docFile.newFilename,
          });
          documentIpfsLink = uploadResult;
        } catch (error) {
          console.error('Ошибка при загрузке документа в IPFS:', error);
          return res.status(500).json({ error: 'Не удалось загрузить документ в IPFS' });
        }
      } else {
        console.error('docFile.filepath is undefined');
        return res.status(500).json({ error: 'Не удалось получить путь к файлу' });
      }
    } else {
      console.error('No documentFile provided');
    }

    // Insert a record into the withdrawals table
    try {
      const insertText = `
        INSERT INTO withdrawals (
          user_address, sender, token_address, amount, bank_name, bik, account_number, swift_code, iban, symbol, tx_hash, country, payment_purpose, document_ipfs_link, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'на исполнении', NOW())
        RETURNING *;
      `;
      const insertValues = [
        user.address,
        sender,
        tokenAddress,
        amount,
        bankName || null,
        bik || null,
        accountNumber || null,
        swiftCode || null,
        iban || null,
        symbol,
        txHash,
        country,
        paymentPurpose,
        documentIpfsLink || null,
      ];

      const result = await query(insertText, insertValues);
      console.log('Withdrawal record created:', result.rows[0]);
    } catch (error) {
      console.error('Ошибка при добавлении записи о выводе средств:', error);
      return res.status(500).json({ error: 'Не удалось создать запись о выводе средств' });
    }

    // Build bank details based on country
    let bankDetails = '';
    if (country === 'RU') {
      bankDetails = `<b>Банк:</b> ${bankName}\n<b>БИК:</b> ${bik}\n<b>Счет:</b> ${accountNumber}`;
    } else if (country === 'CN') {
      bankDetails = `<b>Банк:</b> ${bankName}\n<b>SWIFT:</b> ${swiftCode}\n<b>Счет:</b> ${accountNumber}`;
    } else if (country === 'AE' || country === 'TR') {
      bankDetails = `<b>Банк:</b> ${bankName}\n<b>IBAN:</b> ${iban}`;
    }

    // Build the Telegram message
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const text = `
<b>Новый запрос на вывод средств:</b>
--------------------------
<b>Отправитель:</b> ${sender}
<b>${sender === user.address ? 'Отправитель подтвержден' : 'Отправитель не подтвержден'}</b>
<b>Сумма:</b> ${amount} ${symbol}
${bankDetails}
<b>Страна:</b> ${country}
<b>Назначение платежа:</b> ${paymentPurpose}
${
  documentIpfsLink
    ? `<b>Документ:</b> <a href="${documentIpfsLink}">Ссылка на документ</a>`
    : ''
}
<a href="${explorerBaseURL}${txHash}">Просмотр транзакции</a>
`;

    // Send message to Telegram
    try {
      await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        params: {
          chat_id: CHAT_ID,
          text,
          parse_mode: 'HTML',
        },
      });
      res
        .status(200)
        .json({
          message: 'Сообщение отправлено в Telegram, и вывод средств зарегистрирован успешно',
        });
    } catch (error) {
      console.error('Ошибка при отправке сообщения в Telegram:', error);
      res.status(500).json({ error: 'Не удалось отправить сообщение в Telegram' });
    }
  } catch (error) {
    console.error('Ошибка в обработчике transaction-success:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}

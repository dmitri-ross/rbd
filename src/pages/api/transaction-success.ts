// pages/api/transaction-success.ts

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

// Функция для парсинга входящих данных формы с помощью formidable
const parseForm = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // Лимит 10 МБ
      uploadDir: os.tmpdir(), // Используем временную директорию ОС
      keepExtensions: true, // Сохраняем расширения файлов
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Функция для извлечения значения поля как строки
const getFieldValue = (field: any): string => {
  if (!field) return '';
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
    // Аутентификация пользователя
    const user = await getUser(req);
    if (!user || !user.address) {
      return res.status(401).json({ error: 'Неавторизованный доступ.' });
    }

    // Парсинг данных формы
    const { fields, files } = await parseForm(req);

    // Дебаггинг
    console.log('Fields received:', fields);
    console.log('Files received:', files);

    // Извлечение полей формы
    const sender = getFieldValue(fields.sender);
    const tokenAddress = getFieldValue(fields.tokenAddress);
    const amount = getFieldValue(fields.amount);
    const amountToPay = getFieldValue(fields.amountToPay);
    const inputAmountForeign = getFieldValue(fields.inputAmountForeign);
    const selectedCurrency = getFieldValue(fields.selectedCurrency);
    const beneficiaryType = getFieldValue(fields.beneficiaryType);
    const accountName = getFieldValue(fields.accountName);
    const accountNumber = getFieldValue(fields.accountNumber);
    const bankName = getFieldValue(fields.bankName);
    const swiftOrBik = getFieldValue(fields.swiftOrBik);
    const email = getFieldValue(fields.email);
    const addressField = getFieldValue(fields.addressField);
    const symbol = getFieldValue(fields.symbol);
    const txHash = getFieldValue(fields.txHash);
    const paymentPurpose = getFieldValue(fields.paymentPurpose);

    // Организационные поля
    const organizationName = getFieldValue(fields.organizationName);
    const inn = getFieldValue(fields.inn);
    const kpp = getFieldValue(fields.kpp);
    const legalAddress = getFieldValue(fields.legalAddress);
    const actualAddress = getFieldValue(fields.actualAddress);
    const contactPerson = getFieldValue(fields.contactPerson);
    const phone = getFieldValue(fields.phone);

    // Валидация обязательных полей
    if (!sender || !symbol || !paymentPurpose) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены.' });
    }

    if (symbol === 'INVOICE') {
      if (!amountToPay || !inputAmountForeign || !selectedCurrency) {
        return res.status(400).json({ error: 'Все обязательные поля ��олжны быть заполнены.' });
      }
    } else {
      if (!tokenAddress || !amount || !txHash) {
        return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены.' });
      }
    }

    // Обработка загруженных документов
    const documentFile = files.document;
    const docFile = Array.isArray(documentFile) ? documentFile[0] : documentFile;

    let documentIpfsLink = '';
    if (docFile) {
      console.log('docFile:', docFile);
      console.log('docFile.filepath:', docFile.filepath);

      if (docFile.filepath) {
        // Загрузка документа в IPFS через Thirdweb SDK
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

    // Добавление записи в таблицу withdrawals
    try {
      const insertText = `
        INSERT INTO withdrawals (
          user_address, sender, token_address, amount, 
          amount_to_pay, input_amount_foreign, selected_currency, 
          symbol, tx_hash, payment_purpose, bank_name, 
          swift_or_bik, account_number, bank_address, 
          beneficiary_type, account_name, email, 
          document_ipfs_link, status, 
          organization_name, inn, kpp, legal_address, 
          actual_address, contact_person, phone
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, 
          'на исполнении',
          $19, $20, $21, $22, $23, $24, $25
        )
        RETURNING *;
      `;
      const insertValues = [
        user.address,              // $1
        sender,                    // $2
        tokenAddress || null,      // $3
        amount || null,            // $4
        amountToPay || null,       // $5
        inputAmountForeign || null,// $6
        selectedCurrency || null,  // $7
        symbol,                    // $8
        txHash || null,           // $9
        paymentPurpose,           // $10
        bankName || null,         // $11
        swiftOrBik || null,       // $12
        accountNumber || null,     // $13
        addressField || null,      // $14
        beneficiaryType || null,   // $15
        accountName || null,       // $16
        email || null,            // $17
        documentIpfsLink || null,  // $18
        organizationName || null,  // $19
        inn || null,              // $20
        kpp || null,              // $21
        legalAddress || null,      // $22
        actualAddress || null,     // $23
        contactPerson || null,     // $24
        phone || null             // $25
      ];

      const result = await query(insertText, insertValues);
      console.log('Withdrawal record created:', result.rows[0]);
    } catch (error) {
      console.error('Ошибка при добавлении записи о выводе средств:', error);
      return res.status(500).json({ error: 'Не удалось создать запись о выводе средств' });
    }

    // Формирование банковских деталей
    let bankDetails = `
<b>Тип получателя:</b> ${beneficiaryType}
<b>Наименование счета:</b> ${accountName}
<b>Номер счета:</b> ${accountNumber}
<b>Банк:</b> ${bankName}
<b>${selectedCurrency === 'RUB' ? 'БИК' : 'SWIFT/BIC'}:</b> ${swiftOrBik}
<b>Email:</b> ${email}
<b>Адрес:</b> ${addressField}
`;

    let additionalInfo = '';
    if (organizationName || inn || kpp || legalAddress || actualAddress || contactPerson || phone) {
      additionalInfo = `
<b>Дополнительная информация о плательщике:</b>
<b>Название организации:</b> ${organizationName}
<b>ИНН:</b> ${inn}
<b>КПП:</b> ${kpp}
<b>Юридический адрес:</b> ${legalAddress}
<b>Фактический адрес:</b> ${actualAddress}
<b>Контактное лицо:</b> ${contactPerson}
<b>Телефон:</b> ${phone}
`;
    }

    let transactionLink = txHash ? `<a href="${explorerBaseURL}${txHash}">Просмотр транзакции</a>` : '';

    const text = `
<b>Новый запрос на вывод средств:</b>
--------------------------
<b>Отправитель:</b> ${sender}
<b>${sender === user.address ? 'Отправитель подтвержден' : 'Отправитель не подтвержден'}</b>
<b>Способ оплаты:</b> ${symbol}
<b>Сумма:</b> ${amount || '0'} ${symbol}
<b>Сумма платежа:</b> ${inputAmountForeign || 'N/A'} ${selectedCurrency || ''}
<b>Примерная сумма инвойса:</b> ${amountToPay || 'N/A'} RUB
${bankDetails}
<b>Назначение платежа:</b> ${paymentPurpose}
${additionalInfo}
${documentIpfsLink ? `<b>Документ:</b> <a href="${documentIpfsLink}">Ссылка на документ</a>` : ''}
${transactionLink}
`;

    // Отправка сообщения в Telegram
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    console.error('Ошибка при обработке запроса:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

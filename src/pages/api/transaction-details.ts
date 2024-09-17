// pages/api/transaction-details.ts

import axios from 'axios';
import { getUser } from '../../../auth.config';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import {
  contractAddresses,
  withdrawContractAddress,
  tokenSwapAddress,
} from '../../../const/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUser(req);
  const { hash, symbol } = req.query;

  if (!user || !hash || !symbol) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const apiKey = 'MWBI6FEKWKA82GP5YC8K6TU33WXJ2AZDP4'; // Замените на ваш API ключ
  const baseURL = 'https://api.polygonscan.com/api';

  try {
    // Получаем детали транзакций
    const response = await axios.get(`${baseURL}`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: contractAddresses[symbol as string],
        address: user.address,
        page: 1,
        offset: 100,
        sort: 'desc',
        apikey: apiKey,
      },
    });

    const transactions = response.data.result;

    const transaction = transactions.find((tx: any) => tx.hash === hash);

    if (!transaction) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }

    // Преобразуем значения при необходимости
    transaction.value = (parseInt(transaction.value) / Math.pow(10, parseInt(transaction.tokenDecimal))).toFixed(2);

    // Определяем тип транзакции
    const isOutgoing = transaction.from.toLowerCase() === user.address.toLowerCase();
    transaction.type =
      transaction.to.toLowerCase() === withdrawContractAddress.toLowerCase()
        ? 'Вывод на банковский счет'
        : transaction.to.toLowerCase() === tokenSwapAddress.toLowerCase() || transaction.from.toLowerCase() === tokenSwapAddress.toLowerCase()
        ? 'Обмен'
        : isOutgoing &&
          transaction.from.toLowerCase() !== ethers.constants.AddressZero.toLowerCase()
        ? `Перевод на ${transaction.to}`
        : `Получено от ${transaction.from}`;

    res.status(200).json(transaction);
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    res.status(500).json({ error: 'Не удалось получить детали транзакции' });
  }
}

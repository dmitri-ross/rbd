// pages/api/transaction/[hash].ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { ethers } from 'ethers';
import { getUser } from '../../../../auth.config';
import { findUser } from '../../../util/user';
import {
    contractAddresses,
    withdrawContractAddress,
    tokenSwapAddress,
} from '../../../../const/contracts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { hash } = req.query;
    const user = await getUser(req);

    if (!hash || typeof hash !== 'string') {
        return res.status(400).send('Invalid transaction hash');
    }

    const apiKey = 'MWBI6FEKWKA82GP5YC8K6TU33WXJ2AZDP4'; // Замените на ваш API ключ
    const baseURL = 'https://api.polygonscan.com/api';

    try {
        // Получаем информацию о токен-транзакциях
        const tokenResponse = await axios.get(`${baseURL}`, {
            params: {
                module: 'account',
                action: 'tokentx',
                address: user.address,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: apiKey
            },
        });

        const tokenTransactions = tokenResponse.data.result;
        const tokenTransaction = tokenTransactions.find((tx: any) => tx.hash === hash);

        if (!tokenTransaction) {
            return res.status(404).send('Transaction not found');
        }

        // Получаем бизнес-названия отправителя и получателя
        const sender: any = await findUser(tokenTransaction.from);
        const receiver: any = await findUser(tokenTransaction.to);

        const senderName = sender?.business_name || 'Неизвестная компания';
        const receiverName = receiver?.business_name || 'Неизвестная компания';

        // Определяем, является ли транзакция исходящей
        const isOutgoing = tokenTransaction.from.toLowerCase() === user.address.toLowerCase();

        // Логика определения типа транзакции
        const transactionType =
            tokenTransaction.to.toLowerCase() === withdrawContractAddress.toLowerCase()
                ? "Вывод на банковский счет"
                : tokenTransaction.to.toLowerCase() === tokenSwapAddress.toLowerCase() || tokenTransaction.from.toLowerCase() === tokenSwapAddress.toLowerCase()
                ? "Обмен"
                : isOutgoing &&
                    tokenTransaction.from.toLowerCase() !== ethers.constants.AddressZero.toLowerCase()
                ? `Перевод на адрес ${tokenTransaction.to}`
                : `Получение от адреса ${tokenTransaction.from}`;

        // Добавляем описание транзакции
        let transactionDescription = '';

        if (transactionType === "Обмен") {
            transactionDescription = 'Обмен токенов на платформе РосДАО';
        } else if (transactionType === "Вывод на банковский счет") {
            transactionDescription = 'Вывод средств на привязанный банковский счет';
        } else if (transactionType.startsWith('Перевод на адрес')) {
            transactionDescription = 'Перевод средств другому пользователю через сервис РосДАО';
        } else if (transactionType.startsWith('Получение от адреса')) {
            transactionDescription = 'Получение средств от другого пользователя через сервис РосДАО';
        } else {
            transactionDescription = 'Другая операция через сервис РосДАО';
        }

        // Собираем данные для отображения
        const data = {
            txHash: tokenTransaction.hash,
            date: new Date(parseInt(tokenTransaction.timeStamp) * 1000).toLocaleString(),
            status: 'Успешно',
            from: tokenTransaction.from,
            to: tokenTransaction.to,
            amount: tokenTransaction
                ? (parseInt(tokenTransaction.value) / Math.pow(10, parseInt(tokenTransaction.tokenDecimal))).toFixed(2)
                : ethers.utils.formatEther(tokenTransaction.value),
            tokenSymbol: tokenTransaction ? tokenTransaction.tokenSymbol : 'MATIC',
            network: 'Polygon',
            senderName: senderName,
            receiverName: receiverName,
            transactionType: transactionType,
            transactionDescription: transactionDescription,
        };

        // Генерируем HTML-страницу
        const html = `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Платежное поручение - Транзакция ${data.txHash}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                }
                .container {
                    width: 800px;
                    margin: 0 auto;
                    border: 1px solid #ccc;
                    padding: 20px;
                }
                .header {
                    display: flex;
                    align-items: center;
                    background-color: #8247E5;
                    color: white;
                    padding: 20px;
                }
                .header img {
                    height: 50px;
                    margin-right: 20px;
                }
                .header h1 {
                    margin: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                table, th, td {
                    border: 1px solid #ccc;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #8247E5;
                    color: white;
                }
                .highlight {
                    background-color: #F0EBFF;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    text-align: center;
                }
                .print-button {
                    margin: 20px 0;
                    text-align: center;
                }
                .print-button button {
                    padding: 10px 20px;
                    font-size: 16px;
                }
                @media print {
                    .print-button {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>

        <div class="container">
            <div class="header">
                <img src="/logo.png" alt="Логотип РосДАО">
                <h1>Детали транзакции</h1>
            </div>

            <table>
                <tr>
                    <th colspan="2">Информация о транзакции</th>
                </tr>
                <tr class="highlight">
                    <td><strong>Идентификатор транзакции (TxHash):</strong></td>
                    <td>${data.txHash}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Дата и время выполнения:</strong></td>
                    <td>${data.date}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Статус:</strong></td>
                    <td>${data.status}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Тип операции:</strong></td>
                    <td>${data.transactionType}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Описание операции:</strong></td>
                    <td>${data.transactionDescription}</td>
                </tr>
            </table>

            <table>
                <tr>
                    <th colspan="2">Информация о плательщике</th>
                </tr>
                <tr class="highlight">
                    <td><strong>Название компании:</strong></td>
                    <td>${data.senderName}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Адрес отправителя:</strong></td>
                    <td>${data.from}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Сеть:</strong></td>
                    <td>${data.network}</td>
                </tr>
            </table>

            <table>
                <tr>
                    <th colspan="2">Информация о получателе</th>
                </tr>
                <tr class="highlight">
                    <td><strong>Название компании:</strong></td>
                    <td>${data.receiverName}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Адрес получателя:</strong></td>
                    <td>${data.to}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Сеть:</strong></td>
                    <td>${data.network}</td>
                </tr>
            </table>

            <table>
                <tr>
                    <th colspan="2">Детали платежа</th>
                </tr>
                <tr class="highlight">
                    <td><strong>Сумма:</strong></td>
                    <td>${data.amount} ${data.tokenSymbol}</td>
                </tr>
            </table>

            <div class="print-button">
                <button onclick="window.print()">Распечатать платежное поручение</button>
            </div>

            <div class="footer">
                Документ сформирован с помощью сервиса РОСДАО (https://rosdao.ru)
            </div>
        </div>

        </body>
        </html>
        `;

        // Устанавливаем заголовки и отправляем HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).send('Не удалось получить детали транзакции');
    }
}

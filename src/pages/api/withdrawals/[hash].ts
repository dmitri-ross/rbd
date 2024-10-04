// pages/api/withdrawals/[hash].ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '../../../../auth.config';
import { query } from '@/util/db';
import { ethers } from 'ethers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { hash } = req.query;
    const user = await getUser(req);

    if (!hash || typeof hash !== 'string') {
        return res.status(400).send('Invalid transaction hash');
    }

    if (!user || !user.address) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // Query the withdrawals table using txHash and user address
        const sql = `
            SELECT * FROM withdrawals WHERE tx_hash = $1 AND user_address = $2
        `;
        const values = [hash, user.address];
        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).send('Transaction not found');
        }

        const withdrawal:any = result.rows[0];

        // Prepare data for the payment order
        const data = {
            txHash: withdrawal.tx_hash,
            date: new Date(withdrawal.created_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
            status: withdrawal.status,
            amount: withdrawal.amount,
            symbol: withdrawal.symbol,
            bankName: withdrawal.bank_name || '',
            bik: withdrawal.bik || '',
            accountNumber: withdrawal.account_number || '',
            swiftCode: withdrawal.swift_code || '',
            iban: withdrawal.iban || '',
            country: withdrawal.country,
            paymentPurpose: withdrawal.payment_purpose || '',
            documentIpfsLink: withdrawal.document_ipfs_link || '',
            userAddress: user.address,
            senderName: withdrawal.sender || '',
        };

        // Generate the HTML page
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
                    background-color: #005b99;
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
                    background-color: #005b99;
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
                    cursor: pointer;
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
                <h1>Платежное поручение</h1>
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
                    <td><strong>Сумма:</strong></td>
                    <td>${data.amount} ${data.symbol}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Назначение платежа:</strong></td>
                    <td>${data.paymentPurpose}</td>
                </tr>
            </table>

            <table>
                <tr>
                    <th colspan="2">Банковские реквизиты</th>
                </tr>
                ${data.country === 'RU' ? `
                <tr class="highlight">
                    <td><strong>Наименование банка:</strong></td>
                    <td>${data.bankName}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>БИК:</strong></td>
                    <td>${data.bik}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Номер счета:</strong></td>
                    <td>${data.accountNumber}</td>
                </tr>
                ` : data.country === 'CN' ? `
                <tr class="highlight">
                    <td><strong>Наименование банка:</strong></td>
                    <td>${data.bankName}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>SWIFT код:</strong></td>
                    <td>${data.swiftCode}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Номер счета:</strong></td>
                    <td>${data.accountNumber}</td>
                </tr>
                ` : (data.country === 'AE' || data.country === 'TR') ? `
                <tr class="highlight">
                    <td><strong>Наименование банка:</strong></td>
                    <td>${data.bankName}</td>
                </tr>
                <tr class="highlight">
                    <td><strong>IBAN:</strong></td>
                    <td>${data.iban}</td>
                </tr>
                ` : ''}
            </table>

            ${data.documentIpfsLink ? `
            <table>
                <tr>
                    <th colspan="2">Документ</th>
                </tr>
                <tr class="highlight">
                    <td><strong>Ссылка на документ:</strong></td>
                    <td><a href="${data.documentIpfsLink}" target="_blank">Просмотреть документ</a></td>
                </tr>
            </table>
            ` : ''}

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

        // Set headers and send HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).send('Не удалось получить детали транзакции');
    }
}

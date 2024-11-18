// pages/api/payments.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '../../../auth.config';
import { Pool } from 'pg';

// Интерфейс для записи из таблицы withdrawals
interface Withdrawal {
  id: number;
  user_address: string;
  sender: string;
  token_address: string;
  amount: string;
  bank_name: string | null;
  bik: string | null;
  account_number: string | null;
  swift_code: string | null;
  iban: string | null;
  symbol: string | null;
  tx_hash: string | null;
  country: string | null;
  payment_purpose: string;
  document_ipfs_link: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  amount_to_pay: string | null;
  input_amount_foreign: string | null;
  selected_currency: string | null;
  beneficiary_type: string | null;
  account_name: string | null;
  swift_or_bik: string | null;
  address_field: string | null;
  organization_name: string | null;
  inn: string | null;
  kpp: string | null;
  legal_address: string | null;
  actual_address: string | null;
  contact_person: string | null;
  phone: string | null;
  bank_address: string | null;
  email: string | null;
  invoice_file: string | null;
  receipt_file: string | null;
  // Добавьте любые другие поля из вашей таблицы withdrawals
}

// Интерфейс для ответа с возможным сообщением об ошибке
interface ErrorResponse {
  error: string;
}

// Интерфейс для ответа успешного запроса
interface PaymentResponse extends Withdrawal {
  computed_status: string;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse[] | ErrorResponse>
) {
  try {
    // Получаем информацию о пользователе
    const user = await getUser(req);

    // Проверяем авторизацию
    if (!user || !user.address) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Получаем параметры запроса
    const { currency } = req.query;
    const filterCurrency = currency ? String(currency).toUpperCase() : null;

    // Подключаемся к базе данных
    const client = await pool.connect();
    try {
      // Изменяем SQL-запрос, чтобы возвращать timestamp в UTC
      let sqlQuery = `
        SELECT 
          *,
          created_at AT TIME ZONE 'UTC' as created_at_utc
        FROM withdrawals 
        WHERE sender = $1
      `;
      const queryParams: any[] = [user.address];

      if (filterCurrency) {
        sqlQuery += ' AND symbol = $2';
        queryParams.push(filterCurrency);
      }

      // Выполняем запрос
      const withdrawalsResult = await client.query<Withdrawal>(sqlQuery, queryParams);
      const withdrawals = withdrawalsResult.rows;

      // Обрабатываем каждую запись для вычисления статуса
      const processedWithdrawals: PaymentResponse[] = withdrawals.map((withdrawal) => {
        let computed_status = withdrawal.status || 'на исполнении'; // Если статус отсутствует, устанавливаем по умолчанию

        if (withdrawal.receipt_file) {
          computed_status = 'Исполнен';
        } else if (withdrawal.symbol === 'INVOICE') {
          if (!withdrawal.invoice_file) {
            computed_status = 'Ожидает выставления счета';
          } else {
            computed_status = 'Ожидает оплаты';
          }
        }

        // Преобразуем дату в UTC формат
        const created_at = withdrawal.created_at 
          ? new Date(withdrawal.created_at).toISOString()
          : null;

        return {
          ...withdrawal,
          computed_status,
          created_at,
        };
      });

      // Сортируем записи по дате создания в порядке убывания
      processedWithdrawals.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      // Возвращаем обработанные записи
      return res.status(200).json(processedWithdrawals);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
}

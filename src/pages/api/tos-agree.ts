// pages/api/tos-agree.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '../../../auth.config';
import { query } from '../../util/db';
import axios from 'axios';
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

    const text = `
      UPDATE users
      SET is_tos = true, updated_at = NOW()
      WHERE LOWER(wallet_address) = LOWER($1)
      RETURNING *;
    `;

    const result = await query(text, [user.address]);

    // Проверяем, что обновление прошло успешно
    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Не удалось обновить пользователя.' });
    }

    // Ответ об успешном обновлении
    res.status(200).json({
      message: 'Подтверждено',
    });
  } catch (error: any) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
}

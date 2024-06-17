// src/util/user.js
import { query } from '../util/db';

export const createUser = async (address) => {
  const text = `
    INSERT INTO users ( wallet_address)
    VALUES ( $1)
    ON CONFLICT (wallet_address) DO NOTHING
    RETURNING *;
  `;
  const values = [address];
  try {
    const res = await query(text, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

export const findUser = async (address) => {
  const text = 'SELECT * FROM users WHERE wallet_address = $1';
  const values = [address];
 
  try {
    const res = await query(text, values);
    console.log(res.rows);
    
    return res.rows[0];
  } catch (err) {
    console.error('Error finding user:', err);
    throw err;
  }
};

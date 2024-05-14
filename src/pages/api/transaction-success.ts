import axios from 'axios';
import { getUser } from "../../../auth.config";
import { explorerBaseURL } from "../../../const/contracts";

export default async function handler(req, res) {
  const user = await getUser(req);
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { data } = req.body;
  const { sender, tokenAddress, amount, bankName, bik, accountNumber, symbol, txHash } = data;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;  
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;     
  console.log(req.body); 

  // Styled text message using HTML tags
  const text = `
  <b>Withdrawal Transaction Success:</b>
  --------------------------
  <b>Sender:</b> ${sender}
  <b>${sender == user.address ? 'Valid sender' : 'Invalid sender'}</b>
  <b>Token Address:</b> ${tokenAddress}
  <b>Amount:</b> ${amount} ${symbol}
  <b>Bank Name:</b> ${bankName}
  <b>BIK:</b> ${bik}
  <b>Account Number:</b> ${accountNumber}
  <a href="${explorerBaseURL}${txHash}">Transaction</a>
  `;

  try {
    await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      params: {
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML'  // Set the parse mode to HTML to enable HTML styling
      }
    });
    res.status(200).json({ message: 'Message sent to Telegram successfully' });
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    res.status(500).json({ error: 'Failed to send message to Telegram' });
  }
}

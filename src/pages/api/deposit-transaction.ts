import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { contractAddresses } from "../../../const/contracts";
import axios from 'axios';
import {ethers} from 'ethers';

async function sendMessageToTelegram(transactionHash: string, to: string, amount: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;  // Ensure this is set in your .env.local
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;      // Ensure this is set in your .env.local
  const etherAmount = amount; // Convert wei to ether
  const text = `Deposit transaction minted successfully:
  - Transaction Hash: ${transactionHash}
  - To: ${to}
  - Amount: ${etherAmount}`;

  try {
    await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      params: {
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown'
      }
    });
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    throw new Error('Failed to send message to Telegram');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { to, amount } = req.body;

    if (!process.env.THIRDWEB_AUTH_PRIVATE_KEY) {
      throw new Error("You're missing KEY in your .env file.");
    }

    const sdk = ThirdwebSDK.fromPrivateKey(
      process.env.THIRDWEB_AUTH_PRIVATE_KEY as string,
      "sepolia",
      { secretKey: process.env.TW_SECRET_KEY }
    );

    const tokenContract = await sdk.getContract(contractAddresses["RUB"]);

    const amountBigNumber = ethers.utils.parseEther(amount);

    const tx = await tokenContract.call("mintTo", [to, amountBigNumber.toString()]);
    
    console.log(tx);

    // Send message to Telegram after successful transaction
    await sendMessageToTelegram(tx.receipt.transactionHash, to, amount);

    res.status(200).json({
      "tx": tx.receipt.transactionHash,
      "success": true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: `Server error ${e}` });
  }
}

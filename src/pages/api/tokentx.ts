// pages/api/tokentx.js

import axios from 'axios';
import { getUser } from "../../../auth.config";

export default async function handler(req, res) {

  const user = await getUser(req);
  const { contractAddress } = req.query;
  
  // Define the API key and base URL for Etherscan (replace 'YourApiKeyToken' with your actual API key)
  const apiKey = 'J18SQGKCBXZP86DU6X8V88SA7VEB8CPSQQ';
  const baseURL = 'https://api-sepolia.etherscan.io/api';

  try {
    // Fetch data from Etherscan
    const response = await axios.get(`${baseURL}`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: contractAddress,
        address: user.address,
        page: 1,
        offset: 10,
        sort: 'desc',
        apikey: apiKey
      }
    });
    // Map through transactions to convert values and timestamps
    const transactions = response.data.result.map(tx => ({
      ...tx,
      value: (parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal))).toFixed(2),
      timeStamp: tx.timeStamp 
    }));

    // Return the parsed transactions
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

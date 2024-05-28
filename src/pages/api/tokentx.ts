// pages/api/tokentx.js

import axios from 'axios';
import { getUser } from "../../../auth.config";

export default async function handler(req, res) {

  const user = await getUser(req);
  const { contractAddress } = req.query;
  
  // Define the API key and base URL for Etherscan (replace 'YourApiKeyToken' with your actual API key)
  const apiKey = 'MWBI6FEKWKA82GP5YC8K6TU33WXJ2AZDP4';
  const baseURL = 'https://api.polygonscan.com/api';

  try {
    // Fetch data from Etherscan
    const response = await axios.get(`${baseURL}`, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: contractAddress,
        address: user.address,
        page: 1,
        offset: 20,
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
    console.log(transactions);
    // Return the parsed transactions
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}

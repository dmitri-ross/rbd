import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser } from '../../../auth.config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// IPFS gateway URL - using dweb.link as it's reliable and fast
const IPFS_GATEWAY = `https://${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}.ipfscdn.io/ipfs/`;
// Backup gateways if needed:
// const IPFS_GATEWAY = "https://gateway.ipfs.io/ipfs/";
// const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const user = await getUser(req);
    if (!user || !user.address) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { withdrawal_id, doc } = req.query;
    
    if (!withdrawal_id || !doc) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT invoice_file, receipt_file, document_ipfs_link FROM withdrawals WHERE id = $1 AND sender = $2',
        [withdrawal_id, user.address]
      );
      
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const withdrawal = rows[0];
      let documentUrl = null;

      switch (doc) {
        case 'invoice':
          documentUrl = withdrawal.invoice_file;
          break;
        case 'receipt':
          documentUrl = withdrawal.receipt_file;
          break;
        case 'ipfs':
          documentUrl = withdrawal.document_ipfs_link;
          break;
        default:
          return res.status(400).json({ error: 'Invalid document type' });
      }

      if (!documentUrl) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (documentUrl?.startsWith('ipfs://')) {
        documentUrl = documentUrl.replace('ipfs://', IPFS_GATEWAY);
      }

      res.redirect(documentUrl);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing document request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
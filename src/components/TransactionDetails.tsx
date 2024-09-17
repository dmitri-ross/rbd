// components/TransactionDetails.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Header } from '@/components/Header';
import { AccountHeader } from '@/components/AccountHeader';
import styles from '@/styles/Home.module.css';
import { BackButton } from '@/components/BackButton';
import { ethers } from 'ethers';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  timeStamp: string;
  type: string;
  gasUsed: string;
  gasPrice: string;
  [key: string]: any; // Для дополнительных полей
}

export default function TransactionDetails() {
  const router = useRouter();
  const { hash, symbol } = router.query;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (hash && symbol) {
      const fetchTransactionDetails = async () => {
        try {
          const res = await axios.get(
            `/api/transaction-details?hash=${hash}&symbol=${symbol}`
          );
          setTransaction(res.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching transaction details:', error);
          setLoading(false);
        }
      };

      fetchTransactionDetails();
    }
  }, [hash, symbol]);

  if (loading) return <p>Загрузка деталей транзакции...</p>;
  if (!transaction) return <p>Транзакция не найдена</p>;

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />

      <div className={styles.card}>
        <BackButton />
        <h3>Детали транзакции</h3>

        <div className={styles.receipt}>
          <h2>Платежное поручение</h2>
          <table className={styles.paymentOrderTable}>
            <tbody>
              <tr>
                <td><strong>Дата:</strong></td>
                <td>{new Date(parseInt(transaction.timeStamp) * 1000).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Номер документа:</strong></td>
                <td>{transaction.hash}</td>
              </tr>
              <tr>
                <td><strong>Плательщик:</strong></td>
                <td>{transaction.from}</td>
              </tr>
              <tr>
                <td><strong>Получатель:</strong></td>
                <td>{transaction.to}</td>
              </tr>
              <tr>
                <td><strong>Сумма платежа:</strong></td>
                <td>{transaction.value} {transaction.tokenSymbol}</td>
              </tr>
              <tr>
                <td><strong>Назначение платежа:</strong></td>
                <td>{transaction.type}</td>
              </tr>
              <tr>
                <td><strong>Комиссия сети:</strong></td>
                <td>{(parseInt(transaction.gasUsed) * parseInt(transaction.gasPrice) / 1e18).toFixed(6)} MATIC</td>
              </tr>
              {/* Добавьте дополнительные поля по необходимости */}
            </tbody>
          </table>
        </div>

        {/* Кнопка для печати или скачивания */}
        <button onClick={() => window.print()}>Распечатать платежное поручение</button>
      </div>
    </div>
  );
}

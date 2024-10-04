// components/TokensTxBlock.tsx

import { useEffect, useState } from "react";
import { useUser } from "@thirdweb-dev/react";
import axios from "axios";
import {
  contractAddresses,
  withdrawContractAddress,
  tokenSwapAddress,
} from "../../const/contracts";

const TokensTxBlock = ({ symbol }: { symbol: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(
          `/api/tokentx?contractAddress=${contractAddresses[symbol]}`
        );
        setTransactions(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };

    if (symbol) {
      fetchTransactions();
      const intervalId = setInterval(fetchTransactions, 10000); // Fetch transactions every 10 seconds

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [symbol]);

  if (loading) return <p>Загрузка...</p>;
  if (transactions.length === 0) return <p>Нет транзакций.</p>;

  return (
    <div className="transactions-list">
      {/* Add a wrapper div with class 'table-responsive' */}
      <div className="table-responsive">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип транзакции</th>
              <th>От кого</th>
              <th>Кому</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const userAddress = user?.address.toLowerCase();
              const fromAddress = tx.from.toLowerCase();
              const toAddress = tx.to.toLowerCase();

              const isOutgoing = fromAddress === userAddress;
              const isIncoming = toAddress === userAddress;

              const fromLabel = fromAddress === userAddress ? "Я" : fromAddress;
              const toLabel = toAddress === userAddress ? "Я" : toAddress;

              const sign = isOutgoing ? "-" : "+";
              const amountClass = isOutgoing ? "amount-out" : "amount-in";

              // Determine the transaction type
              let transactionType = "";

              if (tx.to === withdrawContractAddress.toLowerCase()) {
                transactionType = "Вывод на банковский счет";
              } else if (
                tx.to === tokenSwapAddress.toLowerCase() ||
                tx.from === tokenSwapAddress.toLowerCase()
              ) {
                transactionType = "Обмен";
              } else if (isOutgoing) {
                transactionType = "Перевод";
              } else if (isIncoming) {
                transactionType = "Поступление";
              } else {
                transactionType = "Транзакция";
              }

              // Transaction status (assuming all transactions are completed)
              const status = "Исполнено";

              // URL for downloading the payment order
              const paymentOrderUrl = `/api/transaction/${tx.hash}`;
              const txOrderUrl = `/api/withdrawals/${tx.hash}`;
              // Shorten addresses for display
              const shortenAddress = (address: string) =>
                address.slice(0, 6) + "..." + address.slice(-4);

              return (
                <tr key={tx.hash}>
                  <td>{new Date(tx.timeStamp * 1000).toLocaleString()}</td>
                  <td>{transactionType}</td>
                  <td title={fromAddress}>
                    {fromLabel === "Я"
                      ? `Этот счет (${shortenAddress(userAddress)})`
                      : shortenAddress(fromLabel)}
                  </td>
                  <td title={toAddress}>
                    {toLabel === "Я"
                      ? `Этот счет (${shortenAddress(userAddress)})`
                      : shortenAddress(toLabel)}
                  </td>
                  <td className={amountClass}>
                    {sign}
                    {parseFloat(tx.value).toFixed(2)} {tx.tokenSymbol}
                  </td>
                  <td>{status}</td>
                  <td>
                  <button
                      className="download-button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(txOrderUrl, "_blank");
                      }}
                    >
                      Скачать платежное поручение
                    </button><br/>
                    <button
                      className="tx-button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(paymentOrderUrl, "_blank");
                      }}
                    >
                      Детали транзакции
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokensTxBlock;

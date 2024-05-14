// components/TokensTxBlock.js

import styles from "@/styles/Home.module.css";
import shortenAddress from "@/util/formatAddress";
import { Card, CardBody } from "@nextui-org/react";
import {
  useUser
} from "@thirdweb-dev/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { contractAddresses, explorerBaseURL } from "../../const/contracts";

export default function TokensTxBlock({ symbol }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn, isLoading } = useUser();
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
    }
  }, [symbol]);

  if (loading) return <p>Загрузка транзакций...</p>;
  if (transactions.length == 0) return <p>Транзакции не проводились</p>;
  return (
    <div>
      <div className="">
        {transactions.map((tx) => {
          const isOutgoing =
            tx.from.toLowerCase() === user?.address.toLowerCase();
          const sign = isOutgoing ? "-" : "+";
          const amountColor = isOutgoing ? styles.amountOut : styles.amountIn;

          return (
            <a
              key={tx.hash}
              target="_blank"
              href={`${explorerBaseURL}${tx.hash}`}
            >
              <Card className="dark mg-top-20 w-320" fullWidth={true}>
                <CardBody>
                  <div className={styles.nft}>
                    <div className={styles.nftDetails}>
                      <h4>Перевод</h4>
                      <p>
                        Дата: {new Date(tx.timeStamp * 1000).toLocaleString()}
                      </p>
                      <p>
                        Кому: {shortenAddress(isOutgoing ? tx.to : tx.from)}
                      </p>
                      <p className={amountColor}>
                        {sign}
                        {parseFloat(tx.value).toFixed(2)} {tx.tokenSymbol}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}

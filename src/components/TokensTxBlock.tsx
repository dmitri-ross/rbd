// components/TokensTxBlock.tsx

import styles from "@/styles/Home.module.css";
import shortenAddress from "@/util/formatAddress";
import { Card, CardBody } from "@nextui-org/react";
import contractStore from "@/stores/ContractStore";
import {
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  contractAddresses,
  explorerBaseURL,
  withdrawContractAddress,
  tokenSwapAddress,  // Import the swap contract address
} from "../../const/contracts";
import Link from 'next/link';

export default function TokensTxBlock({ symbol }: { symbol: string }) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSD = useContract(contractAddresses["USD"]);
  const metadataUSD = useContractMetadata(contractUSD.contract);

  const contractCNY = useContract(contractAddresses["CNY"]);
  const metadataCNY = useContractMetadata(contractCNY.contract);

  useEffect(() => {
    console.log("loading contracts");

    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USD", contract: contractUSD, metadata: metadataUSD },
      { currency: "CNY", contract: contractCNY, metadata: metadataCNY },
    ];

    contractStore.setContracts(contracts);
    console.log("fetched contracts");
  }, [contractCNY.contract, contractRUB.contract, contractUSD.contract]);

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

  if (loading) return <p>{t('loading')}</p>;
  if (transactions.length === 0) return <p>{t('noTransactions')}</p>;

  return (
    <div>
      <div className="">
        {transactions.map((tx) => {
          const isOutgoing =
            tx.from.toLowerCase() === user?.address.toLowerCase();
          const sign = isOutgoing ? "-" : "+";
          const amountColor = isOutgoing ? styles.amountOut : styles.amountIn;

          // Determine the transaction type based on the contract address involved
          const transactionType =
            tx.to === withdrawContractAddress.toLowerCase()
              ? "Вывод на банковский счет"
              : tx.to === tokenSwapAddress.toLowerCase() || tx.from === tokenSwapAddress.toLowerCase()
              ? "Обмен"
              : isOutgoing &&
                tx.from.toString() !==
                  ethers.constants.AddressZero.toString()
              ? t('to', { address: shortenAddress(tx.to) })
              : t('from', { address: shortenAddress(tx.from) });

          return (
            <Link
              target="_blank"
              key={tx.hash}
              href={`/api/transaction/${tx.hash}`}
            >
              <Card className="dark mg-top-20 w-320" fullWidth={true}>
                <CardBody>
                  <div className={styles.nft}>
                    <div className={styles.nftDetails}>
                      <h4>{t('transfer')}</h4>
                      <p>{t('date')}: {new Date(tx.timeStamp * 1000).toLocaleString()}</p>
                      <p>{transactionType}</p>
                      <p className={amountColor}>
                        {sign}
                        {parseFloat(tx.value).toFixed(2)} {tx.tokenSymbol}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

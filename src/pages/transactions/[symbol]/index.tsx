// pages/transactions.js

import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { ConnectBlock } from "@/components/ConnectBlock";
import { Header } from "@/components/Header";
import TokensTxBlock from "@/components/TokensTxBlock";
import { TopMenu } from "@/components/TopMenu";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
export default function Transactions() {
  const router = useRouter();
  const { symbol } = router.query;

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />

      <div className={styles.card}>
        <BackButton />
        <ConnectBlock onlyBalance={true} symbol={symbol?.toString()} />

        <TopMenu symbol={symbol?.toString()} />
        <h3>Список транзакций {symbol}i:</h3>

        <TokensTxBlock symbol={symbol} />
      </div>
    </div>
  );
}

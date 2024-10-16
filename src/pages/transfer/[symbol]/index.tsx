// pages/transfer/[symbol].js

import { TransferBlock } from "@/components/TransferBlock";
import styles from "@/styles/Transfer.module.css"; // Updated import
import { useRouter } from "next/router";
import { BackButton } from "@/components/BackButton";
export default function Transfer() {
  const router = useRouter();
  const { symbol } = router.query;

  return (
    <>
      <div className="dashboard-header">
      <BackButton />
        <h1>Перевод средств {symbol}:</h1>
        <div className={styles.container}>
          <TransferBlock symbol={symbol?.toString()} />
        </div>
      </div>
    </>
  );
}

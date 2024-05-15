import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { Header } from "@/components/Header";
import { TransferBlock } from "@/components/TransferBlock";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
export default function Transfer() {
  const router = useRouter();
  const { symbol } = router.query;

  

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <BackButton />

        <h3>Перевод средств {symbol}i:</h3>

        <TransferBlock symbol={symbol?.toString()} />
      </div>
    </div>
  );
}

import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { DepositBlock } from "@/components/DepositBlock";
import { Header } from "@/components/Header";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
export default function Deposit() {
  const router = useRouter();
  const { symbol } = router.query;

  

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <BackButton />

        <h3>Депозит средств на {symbol}i:</h3>

        <DepositBlock symbol={symbol} />
      </div>
    </div>
  );
}

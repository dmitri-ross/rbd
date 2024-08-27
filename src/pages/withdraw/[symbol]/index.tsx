import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { Header } from "@/components/Header";
import { WithdrawBlock } from "@/components/WithdrawBlock";
import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
export default function Withdraw() {
  const router = useRouter();
  const { symbol } = router.query;

  
  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
      <BackButton />
        
        <h3>Вывод средств {symbol}:</h3>

        <WithdrawBlock symbol={symbol?.toString()} />
      </div>
    </div>
  );
}

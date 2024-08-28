import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { Header } from "@/components/Header";
import { SwapBlock } from "@/components/SwapBlock";
import styles from "@/styles/Home.module.css";

export default function Swap() {
  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <BackButton />

        <h3 className="mg-20">Обмен токенов:</h3>

        <SwapBlock />
      </div>
    </div>
  );
}

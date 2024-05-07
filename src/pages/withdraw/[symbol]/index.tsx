import { AccountHeader } from "@/components/AccountHeader";
import { DepositBlock } from "@/components/DepositBlock";
import { Header } from "@/components/Header";
import { WithdrawBlock } from "@/components/WithdrawBlock";
import styles from "@/styles/Home.module.css";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/router";
export default function Deposit() {
 
  const router = useRouter();
  const {symbol} = router.query
  // Define contracts with identifiers
  const currencies = ["RUB", "USD", "IND"];


  const handleNavigation = (url) => router.push(url);

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader/>
      <div className={styles.card}>
      <Button
            className="mg-20" 
            onPress={() => handleNavigation("/withdraw")}
            color="secondary"
          >
            Назад
          </Button>
        <h3>Вывод средств {symbol}i:</h3>
    
        <WithdrawBlock symbol={symbol}/>

        </div>
      
    </div>
  );
}

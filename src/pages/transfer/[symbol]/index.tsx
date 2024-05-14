import { AccountHeader } from "@/components/AccountHeader";
import { Header } from "@/components/Header";
import { TransferBlock } from "@/components/TransferBlock";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useRouter } from "next/router";
export default function Transfer() {
  const router = useRouter();
  const { symbol } = router.query;

  
  const goBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <ButtonGroup className="mg-20" variant="shadow" fullWidth={true}>
          <Button
            onPress={goBack}
            color="secondary"
          >
            Назад
          </Button>
        </ButtonGroup>
        <h3>Перевод средств {symbol}i:</h3>

        <TransferBlock symbol={symbol?.toString()} />
      </div>
    </div>
  );
}

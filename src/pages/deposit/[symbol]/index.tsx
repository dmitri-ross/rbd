import { AccountHeader } from "@/components/AccountHeader";
import { DepositBlock } from "@/components/DepositBlock";
import { Header } from "@/components/Header";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useRouter } from "next/router";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
export default function Deposit() {
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
        <Breadcrumbs className="dark mg-10">
          <BreadcrumbItem onClick={goBack}>&#60; Назад</BreadcrumbItem>
        </Breadcrumbs>
        {/* <ButtonGroup className="mg-20" variant="shadow" fullWidth={true}>
          <Button
            onPress={goBack}
            color="secondary"
          >
            Назад
          </Button>
        </ButtonGroup> */}
        <h3>Депозит средств на {symbol}i:</h3>

        <DepositBlock symbol={symbol} />
      </div>
    </div>
  );
}

// pages/transactions.js

import { AccountHeader } from "@/components/AccountHeader";
import { Header } from "@/components/Header";
import { WithdrawBlock } from "@/components/WithdrawBlock";
import TokensTxBlock from "@/components/TokensTxBlock";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { useRouter } from "next/router";
import { ConnectBlock } from "@/components/ConnectBlock";
export default function Transactions() {
  const router = useRouter();
  const { symbol } = router.query;

  const handleNavigation = (url) => router.push(url);

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
          <Button onPress={goBack} color="secondary">
            Назад
          </Button>
        </ButtonGroup> */}
        <ConnectBlock symbol={symbol?.toString()} />
        <ButtonGroup
          className="mg-20 mg-top-20"
          variant="shadow"
          fullWidth={true}
        >
          <Button
            onPress={() => handleNavigation(`/transfer/${symbol}`)}
            color="secondary"
          >
            Перевести
          </Button>
          <Button
            onPress={() => handleNavigation(`/deposit/${symbol}`)}
            color="secondary"
          >
            Купить
          </Button>
          <Button
            onPress={() => handleNavigation(`/withdraw/${symbol}`)}
            color="secondary"
          >
            Вывести
          </Button>
          <Button isDisabled color="secondary">
            Обмен
          </Button>
        </ButtonGroup>
        <h3>Список транзакций {symbol}i:</h3>

        <TokensTxBlock symbol={symbol} />
      </div>
    </div>
  );
}

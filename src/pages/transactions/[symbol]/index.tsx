// pages/transactions.tsx

import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import TokensTxBlock from "@/components/TokensTxBlock";
import { useBalance } from "@thirdweb-dev/react";
import { contractAddresses } from "../../../../const/contracts";
import { useEffect, useState } from "react";
import { useUser } from "@thirdweb-dev/react";

const Transactions = observer(() => {
  const router = useRouter();
  const { symbol } = router.query;

  const { user, isLoggedIn, isLoading } = useUser();

  const [isSymbolReady, setIsSymbolReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    if (router.isReady && symbol) {
      setIsSymbolReady(true);
    }
  }, [router.isReady, symbol]);

  // Проверяем, существует ли символ в contractAddresses
  const contractAddress = symbol && contractAddresses[symbol as string];

  // Используем useBalance только если contractAddress определён
  const { data: balanceData, isLoading: balanceLoading } =
    useBalance(contractAddress);

  const balance =
    !balanceLoading && balanceData
      ? Number(balanceData.displayValue).toFixed(2)
      : "Загрузка...";
  return (
    <>
      {/* Main Content */}
      <div className="dashboard-header">
        <h1>Счет {symbol}</h1>
        {/* Display the account balance */}
        <div className="account-balance">
          <p>
            Баланс счета: {balance} {symbol}
          </p>
        </div>
      </div>

      {/* Top Menu */}

      <div className="wallet-actions">
        <button onClick={() => router.push(`/transfer/${symbol}`)}>
          Перевод
        </button>
        <button onClick={() => router.push("/swap")}>Обмен Валют</button>
        <button onClick={() => router.push(`/deposit/${symbol}`)}>
          Пополнить Счет
        </button>
        <button onClick={() => router.push(`/withdraw/${symbol}?self=true`)}>
          Вывести Средства
        </button>
        {/* Если символ RUB, добавляем кнопку 'Новый Платеж' */}
        {symbol === "RUB" && (
          <button onClick={() => router.push(`/withdraw/${symbol}`)}>
            Новый Платеж
          </button>
        )}
      </div>
      <h2>Список транзакций {symbol}</h2>
      {/* Transactions List */}
      <TokensTxBlock symbol={symbol as string} />
    </>
  );
});

export default Transactions;

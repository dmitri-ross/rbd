// pages/index.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useBalance,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import { observer } from "mobx-react-lite";
import contractStore from "@/stores/ContractStore";
import {
  contractAddresses,
  configMetadataUSDT,
  configMetadataUSDC,
  configMetadataRUBi,
} from "../../const/contracts";
import TokensTxBlock from "../components/TokensTxBlock";
import styles from "../styles/Home.module.css";

const Home = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const { currency } = router.query; // Получаем параметр currency из URL
  const [organizationName, setorganizationName] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("RUR");

  useEffect(() => {
    // Redirect logic
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const UserData: any = user;
    if (UserData?.data) {
      setorganizationName(UserData.data?.organizationName);
    }
  }, [user]);

  // Обрабатываем параметр currency из URL
  useEffect(() => {
    const validCurrencies = ["RUR", "USDT", "USDC", "RUBi"];
    if (
      currency &&
      typeof currency === "string" &&
      validCurrencies.includes(currency)
    ) {
      setSelectedAccount(currency);
    } else {
      setSelectedAccount("RUR"); // Валюта по умолчанию
    }
  }, [currency]);

  // Define balances
  const { data: balanceRUR } = useBalance(contractAddresses["RUR"]);
  const { data: balanceUSDT } = useBalance(contractAddresses["USDT"]);
  const { data: balanceUSDC } = useBalance(contractAddresses["USDC"]);
  const { data: balanceRUBi } = useBalance(contractAddresses["RUBi"]);

  // Contracts and metadata
  const contractRUR = useContract(contractAddresses["RUR"]);
  const { data: metadataRUR } = useContractMetadata(contractRUR.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const { data: metadataUSDT } = configMetadataUSDT;

  const contractUSDC = useContract(contractAddresses["USDC"]);
  const { data: metadataUSDC } = configMetadataUSDC;

  const contractRUBi = useContract(contractAddresses["RUBi"]);
  const { data: metadataRUBi } = configMetadataRUBi;

  const [fetchedContracts, setFetchedContracts] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({
    RUR: "Загрузка...",
    USDT: "Загрузка...",
    USDC: "Загрузка...",
    RUBi: "Загрузка...",
  });

  useEffect(() => {
    // Fetch balances
    const fetchBalances = () => {
      setBalance({
        RUR: balanceRUR?.displayValue
          ? Number(balanceRUR.displayValue).toFixed(2)
          : "0.00",
        USDT: balanceUSDT?.displayValue
          ? Number(balanceUSDT.displayValue).toFixed(2)
          : "0.00",
        USDC: balanceUSDC?.displayValue
          ? Number(balanceUSDC.displayValue).toFixed(2)
          : "0.00",
        RUBi: balanceRUBi?.displayValue
          ? Number(balanceRUBi.displayValue).toFixed(2)
          : "0.00",
      });
    };

    fetchBalances();
    const intervalId = setInterval(fetchBalances, 2000);

    return () => clearInterval(intervalId);
  }, [balanceRUR, balanceUSDT, balanceUSDC, balanceRUBi]);

  useEffect(() => {
    const contracts = [
      { currency: "RUR", contract: contractRUR, metadata: metadataRUR },
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      { currency: "USDC", contract: contractUSDC, metadata: metadataUSDC },
      { currency: "RUBi", contract: contractRUBi, metadata: metadataRUBi },
    ];
    contractStore.setContracts(contracts);

    setFetchedContracts(contracts);
    console.log(contracts);
    console.log(user);
  }, [metadataRUR]);

  const handleAccountClick = (currency: string) => {
    setSelectedAccount(currency);
    console.log(currency);
    router.push(`/?currency=${currency}`, undefined, { shallow: true });
  };

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <>
      {/* Заголовок */}
      <div className="dashboard-header">
        <h1>{organizationName}</h1>
      </div>

      {/* Список счетов */}
      <div className="accounts">
        <h2>Выбор счета:</h2>
        <div className="account-list">
          {fetchedContracts.map(({ currency, metadata }, index) => (
            <div
              onClick={() => handleAccountClick(currency)}
              key={index}
              className={`account ${
                selectedAccount === currency ? "account-selected" : ""
              }`}
            >
              <i className="fas fa-wallet account-icon"></i>
              <span>
                {metadata?.name} ({metadata?.symbol})
              </span>
              <span className="amount">
                {balance[currency]} {metadata?.symbol}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Блок текущего баланса */}
      <div className="current-balance-section">
        <h2>Текущий баланс:</h2>
        <div className="wallet-card">
          <div className="wallet-info">
            <div className="wallet-details">
              <span className="company-name">Баланс</span>
              <span className="balance">
                {balance[selectedAccount]} {selectedAccount}
              </span>
            </div>
            <div className="wallet-actions">
              {selectedAccount === "RUR" ? (
                <>
                  <button onClick={() => handleNavigation(`/withdraw/RUR`)}>
                    Иностранный Платеж
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation(
                        `/swap?inCurrency=RUR&outCurrency=USDT`
                      )
                    }
                  >
                    Купить ИЦП
                  </button>
                  <button onClick={() => handleNavigation(`/deposit/RUR`)}>
                    Пополнить
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation(`/withdraw/RUR?self=true`)
                    }
                  >
                    Вывести
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleNavigation(`/transfer/${selectedAccount}`)
                    }
                  >
                    Отправить
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation(`/deposit/${selectedAccount}`)
                    }
                  >
                    Принять
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation(
                        `/swap?outCurrency=RUR&inCurrency=${selectedAccount}`
                      )
                    }
                  >
                    Купить
                  </button>
                  <button
                    onClick={() =>
                      handleNavigation(
                        `/swap?inCurrency=${selectedAccount}`
                      )
                    }
                  >
                    Обменять
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Компонент транзакций */}
      {selectedAccount && (
        <div className="transactions-section">
          <h2>Транзакции по счету {selectedAccount}:</h2>
          <TokensTxBlock symbol={selectedAccount} />
        </div>
      )}
    </>
  );
});

export default Home;

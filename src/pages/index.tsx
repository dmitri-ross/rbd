// pages/index.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  MediaRenderer,
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
  configMetadataDAI,
} from "../../const/contracts";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import Image from "next/image";

const Home = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  useEffect(() => {
    // Redirect logic
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const UserData: any = user;
    if (UserData?.data) {
      setBusinessName(UserData.data?.businessName);
    }
  }, [user]);

  // Define balances
  const { data: balanceRUB } = useBalance(contractAddresses["RUB"]);
  const { data: balanceUSDT } = useBalance(contractAddresses["USDT"]);
  const { data: balanceUSDC } = useBalance(contractAddresses["USDC"]);
  const { data: balanceDAI } = useBalance(contractAddresses["DAI"]);

  // Contracts and metadata
  const contractRUB = useContract(contractAddresses["RUB"]);
  const { data: metadataRUB } = useContractMetadata(contractRUB.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const { data: metadataUSDT }  = configMetadataUSDT;

  const contractUSDC = useContract(contractAddresses["USDC"]);
  const { data: metadataUSDC } = configMetadataUSDC;

  const contractDAI = useContract(contractAddresses["DAI"]);
  const { data: metadataDAI }  = configMetadataDAI;

  const [fetchedContracts, setFetchedContracts] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({
    RUB: "Загрузка...",
    USDT: "Загрузка...",
    USDC: "Загрузка...",
    DAI: "Загрузка...",
  });

  useEffect(() => {
    // Fetch balances
    const fetchBalances = () => {
      setBalance({
        RUB: balanceRUB?.displayValue
          ? Number(balanceRUB.displayValue).toFixed(2)
          : "0.00",
        USDT: balanceUSDT?.displayValue
          ? Number(balanceUSDT.displayValue).toFixed(2)
          : "0.00",
        USDC: balanceUSDC?.displayValue
          ? Number(balanceUSDC.displayValue).toFixed(2)
          : "0.00",
        DAI: balanceDAI?.displayValue
          ? Number(balanceDAI.displayValue).toFixed(2)
          : "0.00",
      });
    };

    fetchBalances();
    const intervalId = setInterval(fetchBalances, 2000);

    return () => clearInterval(intervalId);
  }, [balanceRUB, balanceUSDT, balanceUSDC, balanceDAI]);

  useEffect(() => {
    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      { currency: "USDC", contract: contractUSDC, metadata: metadataUSDC },
      { currency: "DAI", contract: contractDAI, metadata: metadataDAI },
    ];
    contractStore.setContracts(contracts);
    
    setFetchedContracts(contracts);
    console.log(contracts);
    console.log(user);
  }, [metadataRUB]);

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  // Calculate total RUBi balance
  const totalRUBiBalance = balance["RUB"];

  return (
    <>
      {/* Main Content */}
      <div className="dashboard-header">
        <h1>Главная</h1>
      </div>

      <div className="wallet-card">
        <div className="wallet-info">
          <div className="wallet-details">
            <span className="company-name">{businessName}</span>
            <span className="balance">{totalRUBiBalance} RUBi</span>
          </div>
          <div className="wallet-actions">
            <button onClick={() => handleNavigation("/withdraw/RUB")}>
              Новый Платеж
            </button>
            <button onClick={() => handleNavigation("/swap")}>
              Обмен ИЦП
            </button>
            <button onClick={() => handleNavigation("/deposit/RUB")}>
              Пополнить Счет
            </button>
            <button onClick={() => handleNavigation("/withdraw/RUB?self=true")}>
              Вывести Средства
            </button>
          </div>
        </div>
      </div>

      <div className="accounts">
        
        <h2>Счета Компании:</h2>
        <div className="account-list">
          {/* RUB Account */}
          {fetchedContracts
            .filter(({ currency }) => currency === "RUB")
            .map(({ currency, metadata }, index) => (
              <div
                onClick={() => handleNavigation(`/transactions/${currency}`)}
                key={index}
                className="account"
              >
                <i className="fas fa-ruble-sign account-icon"></i>
                <span>
                  {metadata?.name} ({metadata?.symbol})
                </span>
                <span className="amount">
                  {balance[currency]} {metadata?.symbol}
                </span>
              </div>
            ))}
            </div>
            
          <h2 className="mb-50">ИЦП Компании:</h2>
          <div className="account-list">
          {/* USDT Account */}
          {fetchedContracts
            .filter(({ currency }) => currency === "USDT")
            .map(({ currency, metadata }, index) => (
              <div
                onClick={() => handleNavigation(`/transactions/${currency}`)}
                key={index}
                className="account"
              >
                <i className="fas fa-dollar-sign account-icon"></i>
                <span>
                  {metadata?.name} ({metadata?.symbol})
                </span>
                <span className="amount">
                  {balance[currency]} {metadata?.symbol}
                </span>
              </div>
            ))}

          {/* USDC Account */}
          {fetchedContracts
            .filter(({ currency }) => currency === "USDC")
            .map(({ currency, metadata }, index) => (
              <div
                onClick={() => handleNavigation(`/transactions/${currency}`)}
                key={index}
                className="account"
              >
                <i className="fas fa-dollar-sign account-icon"></i>
                <span>
                  {metadata?.name} ({metadata?.symbol})
                </span>
                <span className="amount">
                  {balance[currency]} {metadata?.symbol}
                </span>
              </div>
            ))}

          {/* DAI Account */}
          {fetchedContracts
            .filter(({ currency }) => currency === "DAI")
            .map(({ currency, metadata }, index) => (
              <div
                onClick={() => handleNavigation(`/transactions/${currency}`)}
                key={index}
                className="account"
              >
                <i className="fas fa-dollar-sign account-icon"></i>
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

      {/* You can add deposits and investments sections similarly if needed */}
    </>
  );
});

export default Home;

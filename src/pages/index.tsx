import { AccountHeader } from "@/components/AccountHeader";
import { ConnectBlock } from "@/components/ConnectBlock";
import { TopMenu } from "@/components/TopMenu";
import { Header } from "@/components/Header";
import contractStore from "@/stores/ContractStore";
import styles from "@/styles/Home.module.css";

import {
  MediaRenderer,
  useBalance,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { contractAddresses, configMetadataUSDT , configMetadataUSDC, configMetadataDAI} from "../../const/contracts";

const Home = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  // Define balances
  const { data: balanceRUB } = useBalance(contractAddresses["RUB"]);
  const { data: balanceUSDT } = useBalance(contractAddresses["USDT"]);
  const { data: balanceUSDC } = useBalance(contractAddresses["USDC"]);
  const { data: balanceDAI } = useBalance(contractAddresses["DAI"]);
  
  // Contract and metadata for RUB tokens
  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const metadataUSDT = configMetadataUSDT;

  const contractUSDC = useContract(contractAddresses["USDС"]);
  const metadataUSDC = configMetadataUSDC;

  const contractDAI = useContract(contractAddresses["DAI"]);
  const metadataDAI = configMetadataDAI;

  const [fetchedContracts, setFetchedContracts] = useState([]);
  const [balance, setBalance] = useState({
    RUB: "Загрузка...",
    USDT: "Загрузка...",
    USDC: "Загрузка...",
    DAI: "Загрузка...",
  });

  useEffect(() => {
    // Fetch balances
    const fetchBalances = () => {
      setBalance({
        RUB: Number(balanceRUB?.displayValue).toFixed(2).toString(),
        USDT: Number(balanceUSDT?.displayValue).toFixed(2).toString(),
        USDC: Number(balanceUSDC?.displayValue).toFixed(2).toString(),
        DAI: Number(balanceDAI?.displayValue).toFixed(2).toString(),
      });
    };

    fetchBalances();
    const intervalId = setInterval(fetchBalances, 2000);

    return () => clearInterval(intervalId);
  }, [balanceRUB, balanceUSDT, balanceUSDC, balanceDAI, balanceRUB]);

  useEffect(() => {
    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      { currency: "USDC", contract: contractUSDC, metadata: metadataUSDC },
      { currency: "DAI", contract: contractDAI, metadata: metadataDAI },
    ];
    contractStore.setContracts(contracts);
    setFetchedContracts(contracts);
  }, [balanceRUB]);

  const handleNavigation = (url) => {
    router.push(url);
  };

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <ConnectBlock />
        <TopMenu />

        {/* Section for ИЦП */}
        <h3>Токены ИЦП:</h3>
        {fetchedContracts
          .filter(({ currency }) => ["USDT", "USDC", "DAI"].includes(currency))
          .map(({ currency, metadata }, index) => (
            !isNaN(balance[currency]) && metadata.data && (
              <div
                onClick={() => handleNavigation(`/transactions/${currency}`)}
                key={index}
                className={styles.nft}
              >
                <MediaRenderer
                  src={metadata.data.image}
                  alt={metadata.data.name}
                  width="70px"
                  height="70px"
                />
                <div className={styles.nftDetails}>
                  <h4>{metadata.data.name}</h4>
                  <p>{balance[currency]} {metadata.data.symbol}</p>
                </div>
              </div>
            )
        ))}

        {/* Section for Токенизированные депозиты */}
        <h3>Токенизированные Депозиты:</h3>
        {fetchedContracts
          .filter(({ currency }) => ["RUB"].includes(currency))
          .map(({ currency, metadata }, index) => (
            !isNaN(balance[currency]) && metadata.data && (
              <div
                onClick={() => handleNavigation(`/transactions/${currency}`)}
                key={index}
                className={styles.nft}
              >
                <MediaRenderer
                  src={metadata.data.image}
                  alt={metadata.data.name}
                  width="70px"
                  height="70px"
                />
                <div className={styles.nftDetails}>
                  <h4>{metadata.data.name}</h4>
                  <p>{balance[currency]} {metadata.data.symbol}</p>
                </div>
              </div>
            )
        ))}
      </div>
    </div>
  );
});

export default Home;

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
import { contractAddresses, configMetadataUSDT } from "../../const/contracts";

const Home = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  const { data: balanceRUB, isLoading: isLoadingRUB } = useBalance(contractAddresses["RUB"]);
  const { data: balanceUSD, isLoading: isLoadingUSD } = useBalance(contractAddresses["USD"]);
  const { data: balanceCNY, isLoading: isLoadingCNY } = useBalance(contractAddresses["CNY"]);
  const { data: balanceUSDT, isLoading: isLoadingUSDT } = useBalance(contractAddresses["USDT"]);

  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSD = useContract(contractAddresses["USD"]);
  const metadataUSD = useContractMetadata(contractUSD.contract);

  const contractCNY = useContract(contractAddresses["CNY"]);
  const metadataCNY = useContractMetadata(contractCNY.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  let metadataUSDT = configMetadataUSDT;

  const [fetchedContracts, setFetchedContracts] = useState([]);

  const [balance, setBalance] = useState({
    RUB: "Загрузка...",
    USD: "Загрузка...",
    CNY: "Загрузка...",
    USDT: "Загрузка...",
  });

  const allBalancesLoaded = !isLoadingRUB && !isLoadingUSD && !isLoadingCNY && !isLoadingUSDT;
  const allMetadataLoaded = metadataRUB?.data && metadataUSD?.data && metadataCNY?.data && metadataUSDT;

  useEffect(() => {
    if (allBalancesLoaded) {
      setBalance({
        RUB: Number(balanceRUB?.displayValue).toFixed(2).toString() || "0.00",
        USD: Number(balanceUSD?.displayValue).toFixed(2).toString() || "0.00",
        CNY: Number(balanceCNY?.displayValue).toFixed(2).toString() || "0.00",
        USDT: Number(balanceUSDT?.displayValue).toFixed(2).toString() || "0.00",
      });
    }
  }, [balanceRUB, balanceUSD, balanceCNY, balanceUSDT, isLoadingRUB, isLoadingUSD, isLoadingCNY, isLoadingUSDT]);

  useEffect(() => {
    if (allMetadataLoaded) {
      const contracts = [
        { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
        { currency: "USD", contract: contractUSD, metadata: metadataUSD },
        { currency: "CNY", contract: contractCNY, metadata: metadataCNY },
        { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      ];

      contractStore.setContracts(contracts);
      setFetchedContracts(contracts);
    }
  }, [metadataRUB, metadataUSD, metadataCNY, metadataUSDT]);

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
        <h3>Ваши токены StableUnion:</h3>
        {!allBalancesLoaded || !allMetadataLoaded ? (
          <p>Загрузка данных...</p>
        ) : (
          fetchedContracts.map(
            ({ currency, metadata }, index) =>
              metadata.data && (
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
                    <p>
                      {balance[currency]} {metadata.data.symbol}
                    </p>
                  </div>
                  {metadata.isLoading && <p>Loading...</p>}
                </div>
              )
          )
        )}
      </div>
    </div>
  );
});

export default Home;

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
import { contractAddresses } from "../../const/contracts";
const Home = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect logic
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);
  const { data: balanceRUB } = useBalance(contractAddresses["RUB"]);
  const { data: balanceUSD } = useBalance(contractAddresses["USD"]);
  const { data: balanceINR } = useBalance(contractAddresses["INR"]);

  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSD = useContract(contractAddresses["USD"]);
  const metadataUSD = useContractMetadata(contractUSD.contract);

  const contractINR = useContract(contractAddresses["INR"]);
  const metadataINR = useContractMetadata(contractINR.contract);

  const [fetchedContracts, setFetchedContracts] = useState([]);

  const [balance, setBalance] = useState({
    RUB: "0.00",
    USD: "0.00",
    IND: "0.00",
  });
  useEffect(() => {
    // Function to update balances
    const fetchBalances = () => {
      console.log("loading balances");
      setBalance({
        RUB: Number(balanceRUB?.displayValue).toFixed(2).toString(),
        USD: Number(balanceUSD?.displayValue).toFixed(2).toString(),
        IND: Number(balanceINR?.displayValue).toFixed(2).toString(),
      });
      console.log("fetched balances");
      console.log(balance);
    };

    // Call fetchBalances initially and set an interval to call it every 5 seconds
    fetchBalances();
    const intervalId = setInterval(fetchBalances, 2000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [balanceRUB, balanceUSD, balanceINR]);

  useEffect(() => {
    console.log("loading contracts");

    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USD", contract: contractUSD, metadata: metadataUSD },
      { currency: "INR", contract: contractINR, metadata: metadataINR },
    ];

    contractStore.setContracts(contracts);
    console.log("fetched contracts");
    setFetchedContracts(contracts);
  }, [contractINR.contract, contractRUB.contract, contractUSD.contract]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    } else if (user?.address) {
    }
  }, [isLoading, isLoggedIn, user, router, contractStore.contractsData]);

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
        <h3>Ваши токены iBDC:</h3>
        {contractStore.contractsData.map(
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
                  <p>{metadata.data.description}</p>
                  <p>
                    {balance[currency]} {metadata.data.symbol}
                  </p>
                </div>
                {metadata.isLoading && <p>Loading...</p>}
              </div>
            )
        )}
      </div>
    </div>
  );
});

export default Home;

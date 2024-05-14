import { AccountHeader } from "@/components/AccountHeader";
import { ConnectBlock } from "@/components/ConnectBlock";
import { Header } from "@/components/Header";
import contractStore from "@/stores/ContractStore";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  MediaRenderer,
  useContract,
  useContractMetadata,
  useUser,
  useBalance,
} from "@thirdweb-dev/react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
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
  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSD = useContract(contractAddresses["USD"]);
  const metadataUSD = useContractMetadata(contractUSD.contract);

  const contractIND = useContract(contractAddresses["IND"]);
  const metadataIND = useContractMetadata(contractIND.contract);

  const { data: balanceRUB } = useBalance(contractAddresses["RUB"]);
  const { data: balanceUSD } = useBalance(contractAddresses["USD"]);
  const { data: balanceINR } = useBalance(contractAddresses["INR"]);
  const [balance, setBalance] = useState({
    RUB: "0.00",
    USD: "0.00",
    IND: "0.00",
  });
  useEffect(() => {
    setBalance({
      RUB: Number(balanceRUB?.displayValue).toFixed(2).toString(),
      USD: Number(balanceUSD?.displayValue).toFixed(2).toString(),
      IND: Number(balanceINR?.displayValue).toFixed(2).toString(),
    });
  }, [
    balanceRUB?.displayValue,
    balanceUSD?.displayValue,
    balanceINR?.displayValue,
  ]);

  const [fetchedContracts, setFetchedContracts] = useState([]);

  useEffect(() => {
    console.log(1);

    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USD", contract: contractUSD, metadata: metadataUSD },
      { currency: "IND", contract: contractIND, metadata: metadataIND },
    ];

    contractStore.setContracts(contracts);
    console.log(2);
    setFetchedContracts(contracts);
    console.log(fetchedContracts);
  }, [contractIND.contract]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    } else if (user?.address) {
      // contractStore.contractsData.forEach(async ({ currency, contract }) => {
      //   if (contract.contract?.erc20) {
      //     try {
      //       const result = await contract.contract.erc20.balanceOf(
      //         user.address
      //       );
      //       setBalance((prev) => ({
      //         ...prev,
      //         [currency]: result.displayValue,
      //       }));
      //     } catch (error) {
      //       console.error(`Failed to fetch the balance for ${currency}`, error);
      //     }
      //   }
      // });
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

        <ButtonGroup
          className="mg-20 mg-top-20"
          variant="shadow"
          fullWidth={true}
        >
          <Button
            onPress={() => handleNavigation("/transfer")}
            color="secondary"
          >
            Перевести
          </Button>
          <Button
            onPress={() => handleNavigation("/deposit")}
            color="secondary"
          >
            Купить
          </Button>
          <Button
            onPress={() => handleNavigation("/withdraw")}
            color="secondary"
          >
            Вывести
          </Button>
          <Button isDisabled color="secondary">
            Обмен
          </Button>
        </ButtonGroup>
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

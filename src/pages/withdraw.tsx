import { Button, ButtonGroup } from "@nextui-org/button";
import { observer } from "mobx-react";
import { useRouter } from "next/router";

import { AccountHeader } from "@/components/AccountHeader";
import { ConnectBlock } from "@/components/ConnectBlock";
import { Header } from "@/components/Header";
import contractStore from "@/stores/ContractStore";
import styles from "@/styles/Home.module.css";
import { useContract, useContractMetadata, useUser } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { contractAddresses } from "../../const/contracts";
const Withdraw = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSD = useContract(contractAddresses["USD"]);
  const metadataUSD = useContractMetadata(contractUSD.contract);

  const contractIND = useContract(contractAddresses["IND"]);
  const metadataIND = useContractMetadata(contractIND.contract);

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

  const handleNavigation = (url) => {
    router.push(url);
  };

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <ButtonGroup className="mg-20" variant="shadow" fullWidth={true}>
          <Button
            onClick={() => handleNavigation("/")} // Changed from onPress to onClick
            color="secondary"
          >
            Назад
          </Button>
        </ButtonGroup>
        <h4>Выберите валюту для вывода средств на банковский счет:</h4>

        {contractStore.contractsData.map(
          ({ currency, metadata }, index) =>
            metadata.data && (
              <Button
                key={index} // Moved key to Button from inner div
                onClick={() => handleNavigation(`/withdraw/${currency}`)} // Changed from onPress to onClick
                className="dark"
              >
                <div className={styles.nft}>
                  <div className={styles.nftDetails}>
                    <h4>
                      {metadata.data.name} ({metadata.data.symbol})
                    </h4>
                  </div>
                  {metadata.isLoading && <p>Loading...</p>}
                </div>
              </Button>
            )
        )}

        <ConnectBlock />
      </div>
    </div>
  );
});

export default Withdraw;

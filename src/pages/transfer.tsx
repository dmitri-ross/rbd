import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { ConnectBlock } from "@/components/ConnectBlock";
import { CurrencyButton } from "@/components/CurrencyButton";
import { Header } from "@/components/Header";
import contractStore from "@/stores/ContractStore";
import styles from "@/styles/Home.module.css";
import { useContract, useContractMetadata, useUser } from "@thirdweb-dev/react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { contractAddresses, configMetadataUSDT } from "../../const/contracts";
const Transfer = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSD = useContract(contractAddresses["USD"]);
  const metadataUSD = useContractMetadata(contractUSD.contract);

  const contractCNY = useContract(contractAddresses["CNY"]);
  const metadataCNY = useContractMetadata(contractCNY.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const metadataUSDT = configMetadataUSDT;

  const [fetchedContracts, setFetchedContracts] = useState([]);

  useEffect(() => {
    console.log(1);

    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USD", contract: contractUSD, metadata: metadataUSD },
      { currency: "CNY", contract: contractCNY, metadata: metadataCNY },
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
    ];

    contractStore.setContracts(contracts);
    console.log(2);
    setFetchedContracts(contracts);
    console.log(fetchedContracts);
  }, [contractCNY.contract]);

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <BackButton />
        <h4 className="mg-20">
          Выберите валюту для перевода средств на другой кошелек:
        </h4>

        {fetchedContracts.map((contract, index) => (
          <CurrencyButton
            key={index}
            action="transfer"
            contract={contract}
            index={index}
          />
        ))}
      </div>
    </div>
  );
});

export default Transfer;

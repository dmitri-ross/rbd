import { AccountHeader } from "@/components/AccountHeader";
import { BackButton } from "@/components/BackButton";
import { ConnectBlock } from "@/components/ConnectBlock";
import { CurrencyButton } from "@/components/CurrencyButton";
import { Header } from "@/components/Header";
import contractStore from "@/stores/ContractStore";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useContract, useContractMetadata, useUser } from "@thirdweb-dev/react";
import { observer } from "mobx-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { contractAddresses } from "../../const/contracts";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
const Deposit = observer(() => {
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

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <BackButton />
        <h4 className="mg-20">Выберите валюту для депозита средств на iBDC:</h4>
        {fetchedContracts.map((contract, index) => (
          <CurrencyButton
            key={index}
            action="deposit"
            contract={contract}
            index={index}
          />
        ))}
      </div>
    </div>
  );
});

export default Deposit;

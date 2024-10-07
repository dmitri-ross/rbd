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
import { contractAddresses, configMetadataUSDT, configMetadataUSDC, configMetadataRUBi } from "../../const/contracts";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";

const Deposit = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  const contractRUR = useContract(contractAddresses["RUR"]);
  const metadataRUR = useContractMetadata(contractRUR.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const metadataUSDT = configMetadataUSDT;

  const contractUSDC = useContract(contractAddresses["USDC"]);
  const metadataUSDC = configMetadataUSDC;

  const contractRUBi = useContract(contractAddresses["RUBi"]);
  const metadataRUBi = configMetadataRUBi;

  const [fetchedContracts, setFetchedContracts] = useState([]);

  useEffect(() => {
    const contracts = [
      { currency: "RUR", contract: contractRUR, metadata: metadataRUR },
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      { currency: "USDC", contract: contractUSDC, metadata: metadataUSDC },
      { currency: "RUBi", contract: contractRUBi, metadata: metadataRUBi },
    ];

    contractStore.setContracts(contracts);
    setFetchedContracts(contracts);
  }, [contractRUR.contract, contractUSDT.contract, contractUSDC.contract, contractRUBi.contract]);

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <BackButton />
        <h4 className="mg-20">Выберите валюту для депозита средств на StableUnion:</h4>

        {/* Раздел для ИЦП */}
        <h3>Токены ИЦП:</h3>
        {fetchedContracts
          .filter(({ currency }) => ["USDT", "USDC", "RUBi"].includes(currency))
          .map((contract, index) => (
            <CurrencyButton
              key={index}
              action="deposit"
              contract={contract}
              index={index}
            />
          ))}

        {/* Раздел для Токенизированных депозитов */}
        <h3>Токенизированные Депозиты:</h3>
        {fetchedContracts
          .filter(({ currency }) => ["RUR"].includes(currency))
          .map((contract, index) => (
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

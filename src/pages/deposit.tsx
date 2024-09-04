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
import { contractAddresses, configMetadataUSDT, configMetadataUSDC, configMetadataDAI } from "../../const/contracts";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";

const Deposit = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  const contractRUB = useContract(contractAddresses["RUB"]);
  const metadataRUB = useContractMetadata(contractRUB.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const metadataUSDT = configMetadataUSDT;

  const contractUSDC = useContract(contractAddresses["USDC"]);
  const metadataUSDC = configMetadataUSDC;

  const contractDAI = useContract(contractAddresses["DAI"]);
  const metadataDAI = configMetadataDAI;

  const [fetchedContracts, setFetchedContracts] = useState([]);

  useEffect(() => {
    const contracts = [
      { currency: "RUB", contract: contractRUB, metadata: metadataRUB },
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      { currency: "USDC", contract: contractUSDC, metadata: metadataUSDC },
      { currency: "DAI", contract: contractDAI, metadata: metadataDAI },
    ];

    contractStore.setContracts(contracts);
    setFetchedContracts(contracts);
  }, [contractRUB.contract, contractUSDT.contract, contractUSDC.contract, contractDAI.contract]);

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
          .filter(({ currency }) => ["USDT", "USDC", "DAI"].includes(currency))
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
          .filter(({ currency }) => ["RUB"].includes(currency))
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

import { AccountHeader } from "@/components/AccountHeader";
import { ConnectBlock } from "@/components/ConnectBlock";
import { Header } from "@/components/Header";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import {
  MediaRenderer,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { contractAddresses } from "../../const/contracts";

export default function Deposit() {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  // Define contracts with identifiers
  const contracts = ["RUB", "USD", "IND"].map((currency) => {
    const contract = useContract(contractAddresses[currency]);
    const metadata = useContractMetadata(contract.contract);
    return { currency, contract, metadata };
  });

  const handleNavigation = (url) => router.push(url);

  return (
    <div className={styles.container}>
      <Header />
      <AccountHeader />
      <div className={styles.card}>
        <Button
          className="mg-20"
          onPress={() => handleNavigation("/")}
          color="secondary"
        >
          Назад
        </Button>
        <h4>Выберите валюту для депозита средств на iBDC:</h4>
        
        {contracts.map(
          ({ currency, metadata }, index) =>
            metadata.data && (
              <Button
                onPress={() => handleNavigation(`/deposit/${currency}`)}
                
                className="dark"
               
              >
                <div key={index} className={styles.nft}>
                 
                  <div className={styles.nftDetails}>
                    <h4>{metadata.data.name} ({metadata.data.symbol})</h4>
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
}

import { AccountHeader } from "@/components/AccountHeader";
import { ConnectBlock } from "@/components/ConnectBlock";
import { Header } from "@/components/Header";
import styles from "@/styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  MediaRenderer,
  useContract,
  useContractMetadata,
  useUser
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { contractAddresses } from "../../const/contracts";

export default function Home() {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();

  // Define contracts with identifiers
  const contracts = ["RUB", "USD", "IND"].map((currency) => {
    const contract = useContract(contractAddresses[currency]);
    const metadata = useContractMetadata(contract.contract);
    return { currency, contract, metadata };
  });

  const [balance, setBalance] = useState({
    RUB: "0.00",
    USD: "0.00",
    IND: "0.00",
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    } else if (user?.address) {
      contracts.forEach(async ({ currency, contract }) => {
        if (contract.contract?.erc20) {
          try {
            const result = await contract.contract.erc20.balanceOf(
              user.address
            );
            setBalance((prev) => ({
              ...prev,
              [currency]: result.displayValue,
            }));
          } catch (error) {
            console.error(`Failed to fetch the balance for ${currency}`, error);
          }
        }
      });
    }
  }, [isLoading, isLoggedIn, user, router, contracts]);

  const handleNavigation = (url) => router.push(url);

  return (
    <div className={styles.container}>
      <Header />

      <AccountHeader/>
      
      <div className={styles.card}>
        <ButtonGroup className="mg-20" variant="shadow" fullWidth={true}>
          <Button
            onPress={() => handleNavigation("/deposit")}
            color="secondary"
          >
            Депозит
          </Button>
          <Button onPress={() => handleNavigation("/withdraw")} color="secondary">Вывод</Button>
          <Button isDisabled color="secondary">
            Обмен
          </Button>
        </ButtonGroup>
        <h3>Ваш баланс iBDC:</h3>
        {contracts.map(
          ({ currency, metadata }, index) =>
            metadata.data && (
              <div key={index} className={styles.nft}>
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
        <ConnectBlock/>
      </div>
    </div>
  );
}

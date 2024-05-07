import {
  ConnectWallet,
  MediaRenderer,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { contractAddress } from "../../const/yourDetails";
import { Header } from "../components/Header";
import styles from "../styles/Home.module.css";
import checkBalance from "../util/checkBalance";
import getServerSideProps from "../util/props";
import { Sepolia } from "@thirdweb-dev/chains";
export default function Home() {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const { contract } = useContract(contractAddress);
  const { data: contractMetadata, isLoading: contractLoading } =
    useContractMetadata(contract);
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    } else if (contract && user?.address) {
      (async () => {
        try {
          const balance = await contract.erc20.balanceOf(user?.address);
          setBalance(balance.displayValue);
          console.log(balance.displayValue);
        } catch (error) {
          console.error("Failed to fetch the balance", error);
        }
      })();
    }
  }, [isLoading, isLoggedIn, user, router]);

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.heading}>Кошелек: iBDC (iBank Digital Currency)</h2>
      <h1 className={styles.h1}>Личный кабинет</h1>

      <p className={styles.explain}>
        Покупайте и продавайте банковские токены iBDC, используя свой банковский
        счет.
      </p>

      <div className={styles.card}>
        <h3>Ваш баланс iBDC:</h3>
        <p></p>

        {contractMetadata && (
          <div className={styles.nft}>
            <MediaRenderer
              src={contractMetadata.image}
              alt={contractMetadata.name}
              width="70px"
              height="70px"
            />
            <div className={styles.nftDetails}>
              <h4>{contractMetadata.name}</h4>
              <p>{contractMetadata.description}</p>
              <p>
                {balance} {contractMetadata.symbol}
              </p>
            </div>
          </div>
        )}
        {contractLoading && <p>Loading...</p>}

        <ConnectWallet
          hideSwitchToPersonalWallet={true}
          displayBalanceToken={{
            11155111: "0xf5423Aa5B7b0FD6C40aACbfAA08Ef0435B5Ed233",
          }}
          supportedTokens={{
            [11155111]: [
              {
                address: "0xf5423Aa5B7b0FD6C40aACbfAA08Ef0435B5Ed233", // token contract address
                name: "Digital Ruble",
                symbol: "RUBD",
                icon: `https://adfdc075945d7175b430c250264cf70e.ipfscdn.io/ipfs/bafybeibjllqrgnuhyq5hkflvu2hbeppe3g444c6xrwrxjdqj4s7u7q7lda/DALL%C2%B7E%202024-04-30%2013.54.00%20-%20Create%20a%20modern%2C%20sleek%20logo%20inspired%20by%20the%20uploaded%20image%20but%20designed%20for%20a%20digital%20currency%20named%20'Digital%20Ruble'.%20The%20logo%20should%20feature%20three%20st.png`,
              },
            ],
          }}
          theme="dark"
          className={styles.connect}
        />
      </div>
    </div>
  );
}



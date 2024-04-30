import {
  ConnectWallet,
  MediaRenderer,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getUser } from "../../auth.config";
import { contractAddress } from "../../const/yourDetails";
import { Header } from "../components/Header";
import styles from "../styles/Home.module.css";
import checkBalance from "../util/checkBalance";
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
  }, [isLoading, isLoggedIn, router, contractMetadata]);

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.heading}>Кошелек: RUBD (Цифровой Рубль)</h2>
      <h1 className={styles.h1}>Авторизация</h1>

      <p className={styles.explain}>
        Покупайте и продавайте RUBD, используя свой рублевый счет.
      </p>

      <div className={styles.card}>
        <h3>Ваш баланс RUBD:</h3>
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
          displayBalanceToken={{11155111: "0xf5423Aa5B7b0FD6C40aACbfAA08Ef0435B5Ed233"}}
          supportedTokens={{
            [11155111]: [
                {
                    address: '0xf5423Aa5B7b0FD6C40aACbfAA08Ef0435B5Ed233', // token contract address
                    name: 'Digital Ruble',
                    symbol: 'RUBD',
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

// This gets called on every request
export async function getServerSideProps(context) {
  const user = await getUser(context.req);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const secretKey = process.env.TW_SECRET_KEY;

  if (!secretKey) {
    console.log("Missing env var: TW_SECRET_KEY");
    throw new Error("Missing env var: TW_SECRET_KEY");
  }

  // Ensure we are able to generate an auth token using our private key instantiated SDK
  const PRIVATE_KEY = process.env.THIRDWEB_AUTH_PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    throw new Error("You need to add an PRIVATE_KEY environment variable.");
  }

  // Instantiate our SDK
  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.THIRDWEB_AUTH_PRIVATE_KEY,
    "sepolia",
    { secretKey }
  );

  // Check to see if the user has an NFT
  const hasNft = await checkBalance(sdk, user.address);

  // If they don't have an NFT, redirect them to the login page
  if (!hasNft) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Finally, return the props
  return {
    props: {},
  };
}

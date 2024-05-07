import {
  ConnectWallet,
  MediaRenderer,
  useAddress,
  useContract,
  useContractMetadata,
  useUser
} from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getUser } from "../../auth.config";
import { contractAddress } from "../../const/yourDetails";
import { Header } from "../components/Header";
import styles from "../styles/Home.module.css";

export default function Login() {
  const { contract } = useContract(contractAddress);
  const { data: contractMetadata, isLoading: contractLoading } =
    useContractMetadata(contract);
  const address = useAddress();
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useUser();
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/");
    }
  }, [router, isLoggedIn]);

  return (
    <div className={styles.container}>
      <Header />
      <h2 className={styles.heading}>Кошелек iBDC (iBank Digital Currency)</h2>
      <h1 className={styles.h1}>Авторизация</h1>

      <p className={styles.explain}>
        Покупайте и продавайте банковские токены iBDC, используя свой банковский
        счет.
      </p>

      <div className={styles.card}>
        <ConnectWallet theme="dark" className={styles.connect} />
      </div>
    </div>
  );
}

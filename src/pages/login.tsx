import {
  ConnectWallet,
  useUser
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Header } from "../components/Header";
import styles from "../styles/Home.module.css";

export default function Login() {
 
  
  const router = useRouter();
  const { isLoggedIn } = useUser();
  useEffect(() => {
    if (isLoggedIn) {
      // router.push("/");
      window.location.href = "/";
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

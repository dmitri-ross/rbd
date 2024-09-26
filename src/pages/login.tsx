import { ConnectWallet, useUser } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import Link from "next/link";
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
    <>
      
      <div className={styles.container}>
      <Link href="/">
          <Image
            src="/logol.png"
            alt="logo"
            width={155}
            height={33}
          />
        </Link>
        <h2 className={styles.heading}> Ваш аккант в РОСДАО</h2>
        <h1 className={styles.h1}>Авторизация</h1>

        <p className={styles.explain}>
          Покупайте, продавайте и управляйте цифровыми активами на публичных
          реестрах.
        </p>

        <div className={styles.card}>
          <ConnectWallet theme="light" className={styles.connect} />
        </div>
      </div>
    </>
  );
}

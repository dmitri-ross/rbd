// pages/login.js

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
      router.push("/");
      // Alternatively, using window.location.href if needed
      // window.location.href = "/";
    }
  }, [router, isLoggedIn]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <Link href="/" className={styles.logoLink} passHref>
          <Image
            src="/logol.png"
            alt="РосДАО Логотип"
            width={155}
            height={33}
            className={styles.logoImage}
          />
        </Link>

        <h2 className={styles.loginHeading}>Ваш аккаунт в РОСДАО</h2>
        <h1 className={styles.loginTitle}>Авторизация</h1>

        <p className={styles.loginDescription}>
        Помощь в валютных операциях в легальной внешнеэкономической деятельности
        </p>

        <div className={styles.loginCard}>
          {/* Custom Connect/Login Button */}
          <ConnectWallet
            theme="light"
            className={styles.connectButton}
            btnTitle="Войти или зарегистрироваться"
          />
        </div>

        <p className={styles.loginFooter}>
          Нажимая кнопку, вы соглашаетесь с нашими{" "}
          <Link className={styles.termsLink} href="https://docs.rosdao.ru/ustav-i-pravovye-dokumenty/pravovye-dokumenty" passHref>
            Условиями использования
          </Link>{" "}
          и{" "}
          <Link className={styles.privacyLink} href="https://docs.rosdao.ru/ustav-i-pravovye-dokumenty/pravovye-dokumenty" passHref>
            Политикой конфиденциальности
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

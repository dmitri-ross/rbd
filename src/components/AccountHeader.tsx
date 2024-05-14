import { ConnectWallet } from "@thirdweb-dev/react";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export const AccountHeader = () => {
  return (
    <>
      <h2 className={styles.heading}>Кошелек: iBDC (iBank Digital Currency)</h2>
      <p className={styles.explain}>
        Покупайте и продавайте банковские токены iBDC, используя свой банковский
        счет.
      </p>
    </>
  );
};

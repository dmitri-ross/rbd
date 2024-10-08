import { ConnectWallet } from "@thirdweb-dev/react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Header.module.css";


export const Header = () => {
  return (
    <nav className={styles.header}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="logo"
          width={155}
          height={33}
          className={styles.logo}
        />
      </Link>
      
      {/* <ConnectWallet  theme={"dark"} /> */}
    </nav>
  );
};

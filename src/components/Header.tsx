import { ConnectWallet } from "@thirdweb-dev/react";
import Image from "next/image";
import styles from "../styles/Header.module.css";
import Link from "next/link";

export const Header = () => {
  return (
    <nav className={styles.header}>
      <Link href="/">
        <Image
          src="/logo.png"
          alt="logo"
          width={135}
          height={22}
          className={styles.logo}
        />
      </Link>
      
      {/* <ConnectWallet  theme={"dark"} /> */}
    </nav>
  );
};

// pages/_app.tsx or similar

import {
  ThirdwebProvider,
  metamaskWallet,
  walletConnect,
  embeddedWallet,
  smartWallet,
} from "@thirdweb-dev/react";
import { contractAddresses } from "../../const/contracts";
import Head from "next/head";
import { domainName } from "../../const/contracts";
import russian from "../util/ru";
import "../styles/globals.css";
import { Polygon } from "@thirdweb-dev/chains";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import Link from "next/link";
import Image from "next/image";
import { ConnectBlock } from "@/components/ConnectBlock";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when route changes (optional)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [router.pathname]);

  // Menu items
  const menuItems = [
    { href: "/", icon: "fas fa-wallet", label: "Счета и Балансы" },
    {
      href: "/withdraw/RUB",
      icon: "fas fa-file-invoice-dollar",
      label: "Новый платеж",
    },
    { href: "/swap", icon: "fas fa-swap-alt", label: "Обмен ИЦП" },
    {
      href: "/deposit/RUB",
      icon: "fas fa-credit-card",
      label: "Пополнить Счет",
    },
    {
      href: "/withdraw/RUB?self=true",
      icon: "fas fa-hand-holding-usd",
      label: "Вывести Средства",
    },
  ];

  // Function to check if menu item is active
  const isActive = (item) => {
    return router.asPath === item.href;
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ThirdwebProvider
        locale={russian}
        activeChain={Polygon}
        supportedChains={[Polygon]}
        clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
        authConfig={{
          domain: domainName,
          authUrl: "/api/auth",
        }}
        supportedWallets={[
          smartWallet(metamaskWallet(), {
            factoryAddress: "0xc31aeCC486a5EE5019cD9834191A42e6238733ff",
            gasless: true,
          }),
          smartWallet(walletConnect(), {
            factoryAddress: "0xc31aeCC486a5EE5019cD9834191A42e6238733ff",
            gasless: true,
          }),
          smartWallet(
            embeddedWallet({
              auth: {
                options: ["email", "google", "facebook"],
              },
              recommended: true,
            }),
            {
              factoryAddress: "0xc31aeCC486a5EE5019cD9834191A42e6238733ff",
              gasless: true,
            }
          ),
        ]}
      >
        <Head>
          <title>РосДАО.БизнесОнлайн</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta
            name="description"
            content="Покупайте, продавайте и обменивайте цифровые активы от доверенных эмитентов."
          />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </Head>

        {router.pathname !== "/login" ? (
          <>
            {/* Header */}
            <header className="header">
              {/* Menu toggle button for mobile */}
              <button className="menu-toggle" onClick={toggleSidebar}>
                <svg
                  className="menu-icon"
                  enable-background="new 0 0 464.205 464.205"
                  viewBox="0 0 464.205 464.205"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g>
                    <g id="grip-solid-horizontal_1_">
                      <path d="m435.192 406.18h-406.179c-16.024 0-29.013-12.99-29.013-29.013s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.99 29.013 29.013-.001 16.023-12.99 29.013-29.014 29.013z" />
                      <path d="m435.192 261.115h-406.179c-16.024 0-29.013-12.989-29.013-29.012s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.989 29.013 29.013s-12.99 29.012-29.014 29.012z" />
                      <path d="m435.192 116.051h-406.179c-16.024 0-29.013-12.989-29.013-29.013s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.989 29.013 29.013s-12.99 29.013-29.014 29.013z" />
                    </g>
                  </g>
                </svg>
              </button>
              <div></div>
              <div className="user-info">
                <ConnectBlock />
              </div>
            </header>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
              <ul className="menu-toggle">
                <li>
                  <button className="menu-toggle" onClick={toggleSidebar}>
                    <svg
                      className="menu-icon"
                      enable-background="new 0 0 464.205 464.205"
                      viewBox="0 0 464.205 464.205"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g>
                        <g id="grip-solid-horizontal_1_">
                          <path d="m435.192 406.18h-406.179c-16.024 0-29.013-12.99-29.013-29.013s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.99 29.013 29.013-.001 16.023-12.99 29.013-29.014 29.013z" />
                          <path d="m435.192 261.115h-406.179c-16.024 0-29.013-12.989-29.013-29.012s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.989 29.013 29.013s-12.99 29.012-29.014 29.012z" />
                          <path d="m435.192 116.051h-406.179c-16.024 0-29.013-12.989-29.013-29.013s12.989-29.013 29.013-29.013h406.18c16.023 0 29.013 12.989 29.013 29.013s-12.99 29.013-29.014 29.013z" />
                        </g>
                      </g>
                    </svg>
                  </button>
                </li>
              </ul>
              <div className="logo">
                <Link href="/" legacyBehavior>
                  <a>
                    <Image
                      src="/logo.png"
                      alt="РосДАО Логотип"
                      width={180}
                      height={55}
                    />
                  </a>
                </Link>
              </div>
              <ul>
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} legacyBehavior>
                      <a className={isActive(item) ? "active" : ""}>
                        <i className={item.icon}></i> <span>{item.label}</span>
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Overlay for mobile menu */}
            {isSidebarOpen && (
              <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}

            {/* Main content */}
            <main className="main-content">
              <Component {...pageProps} />
            </main>

            {/* Footer */}
            <footer className="footer">
              <p>
                Служба поддержки:{" "}
                <a href="mailto:support@rosdao.ru">support@rosdao.ru</a> |
                Телефон: +7 (495) 123-45-67
              </p>
              <div className="footer-links">
                <a href="https://docs.stableunion.org/">Документация</a>
              </div>
            </footer>
          </>
        ) : (
          <>
            <div className="login">
              <main className="main-content">
                <Component {...pageProps} />
              </main>
              <footer className="login footer">
                <p>
                  Служба поддержки:{" "}
                  <a href="mailto:support@rosdao.ru">support@rosdao.ru</a> |
                  Телефон: +7 (495) 123-45-67
                </p>
                <div className="footer-links">
                  <a href="https://docs.stableunion.org/">Документация</a>
                </div>
              </footer>
            </div>
          </>
        )}
      </ThirdwebProvider>
    </I18nextProvider>
  );
}

export default MyApp;

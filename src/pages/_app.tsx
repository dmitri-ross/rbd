import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  embeddedWallet,
  smartWallet,
  useContract,
  useContractMetadata,
} from "@thirdweb-dev/react";
import { contractAddresses } from "../../const/contracts";
import Head from "next/head";
import { domainName } from "../../const/contracts";
import russian from "../util/ru";
import "../styles/globals.css";
import { Polygon } from "@thirdweb-dev/chains";
import { NextUIProvider } from "@nextui-org/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18n";
import { fontSize } from "@thirdweb-dev/react/dist/declarations/src/design-system";

function App({ Component, pageProps }) {
  return (
    <I18nextProvider i18n={i18n}>
      <NextUIProvider>
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
            // embeddedWallet({
            //   auth: {
            //     options: ["email", "google", "facebook", "apple"],
            //   },
            //   recommended: true
            // }),
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
            <title>Кошелек StableUnion v0.2</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta
              name="description"
              content="Покупайте, продавайте и обменивайте цифровые активы от доверенных эмитентов."
            />
          </Head>

          <Component {...pageProps} />

          {/* Footer */}
          <footer style={footerStyle}>
            <div style={footerContentStyle}>
              <p style={disclaimerStyle}>
                Платформа работает в тестовом режиме. Для получения возможности
                пополнения счета обратитесь к администратору{" "}
                <a href="mailto:admin@stableunion.org" style={footerLinkStyle}>
                  admin@stableunion.org
                </a>
                .
              </p>
            </div>
            <div style={footerContentStyle}>
              <a
                href="https://rosdao.ru/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/rosdao.png"
                  alt="ROS DAO Logo"
                  style={{ height: "40px", marginLeft: "10px" }}
                />
              </a>

              <br />
              <a
                href="https://docs.stableunion.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={footerLinkStyle}
              >
                Документация
              </a>
            </div>
          </footer>
        </ThirdwebProvider>
      </NextUIProvider>
    </I18nextProvider>
  );
}

// Footer styles
const footerStyle: any = {
  fontSize: "12px",
  padding: "20px 0",

  textAlign: "center",
  marginTop: "10px",
};

const footerContentStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "15px",
};

const footerLinkStyle = {
  marginLeft: "10px",
  textDecoration: "none",
  color: "#bbbbbc",
};
const disclaimerStyle: any = {
  fontSize: "12px",
  color: "#bbbbbc",
  marginBottom: "10px",
  textAlign: "center",
  maxWidth: "600px",
};
export default App;

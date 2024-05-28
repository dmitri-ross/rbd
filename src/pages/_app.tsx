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
                  options: ["email", "google", "facebook", "apple"],
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
            <title>Кошелек iBDC v0.1</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <meta
              name="description"
              content="Покупайте и продавайте банковские токены iBDC, используя свой банковский счет."
            />
          </Head>

          <Component {...pageProps} />
        </ThirdwebProvider>
      </NextUIProvider>
    </I18nextProvider>
  );
}

export default App;

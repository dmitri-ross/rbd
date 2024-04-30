import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  embeddedWallet,
  smartWallet,
} from "@thirdweb-dev/react";
import Head from "next/head";
import { domainName } from "../../const/yourDetails";
import russian from "../util/ru";
import "../styles/globals.css";
import { Sepolia } from "@thirdweb-dev/chains";

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebProvider
      locale={russian}
      activeChain={Sepolia}
      supportedChains={[Sepolia]}
      clientId={process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}
      authConfig={{
        domain: domainName,
        authUrl: "/api/auth",
      }}
      supportedWallets={[
        // metamaskWallet(),
        // coinbaseWallet(),
        // walletConnect(),
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
          { factoryAddress: "0xc31aeCC486a5EE5019cD9834191A42e6238733ff", gasless: true }
        ),
      ]}
    >
      <Head>
        <title>Кошелек RUBD v0.1</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Learn how to use the thirdweb Auth SDK to create an NFT Gated Website"
        />
      </Head>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}

export default MyApp;

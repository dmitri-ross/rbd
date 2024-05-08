import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  embeddedWallet,
  smartWallet,  useContract,
  useContractMetadata,
} from "@thirdweb-dev/react";
import { contractAddresses } from "../../const/contracts";
import Head from "next/head";
import { domainName } from "../../const/contracts";
import russian from "../util/ru";
import "../styles/globals.css";
import { Sepolia } from "@thirdweb-dev/chains";
import { NextUIProvider } from "@nextui-org/react";

function App({ Component, pageProps }) {


   
  return (
    <NextUIProvider>
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
            content="Learn how to use the thirdweb Auth SDK to create an NFT Gated Website"
          />
        </Head>
        
          <Component  {...pageProps} />
      </ThirdwebProvider>
    </NextUIProvider>
  );
}

export default App;

import { ConnectWallet } from "@thirdweb-dev/react";
import { contractAddresses } from "../../const/contracts";
export const ConnectBlock = ({ symbol = "RUB" , onlyBalance = false}) => {

  
  return (
    <ConnectWallet
    modalTitleIconUrl={""}
    hideSwitchToPersonalWallet={true}
    displayBalanceToken={{
      137: contractAddresses[symbol],
    }}
    supportedTokens={{
      [137]: [
        {
          address: contractAddresses["RUB"],
          name: "Digital Ruble",
          symbol: "RUBi",
          icon: `/rub.png`,
        },
        {
          address: contractAddresses["USD"],
          name: "Digital US Dollar",
          symbol: "USDi",
          icon: `/usd.png`,
        },
        {
          address: contractAddresses["CNY"],
          name: "Digital Rupee",
          symbol: "CNYi",
          icon: `/CNY.png`,
        },
      ],
    }}
    theme="dark"
    className={`connect ${onlyBalance ? 'onlyBalance' : 'balance'}`}
  />
  );
};

import { ConnectWallet } from "@thirdweb-dev/react";
import { contractAddresses } from "../../const/contracts";
export const ConnectBlock = ({ symbol = "RUB" , onlyBalance = false}) => {

  
  return (
    <ConnectWallet
    modalTitleIconUrl={""}
    hideSwitchToPersonalWallet={true}
    displayBalanceToken={{
      11155111: contractAddresses[symbol],
    }}
    supportedTokens={{
      [11155111]: [
        {
          address: "0xe546AE1D6c9b8F5B7AE856Da9E9148Db05564B94",
          name: "Digital Ruble",
          symbol: "RUBi",
          icon: `/rub.png`,
        },
        {
          address: "0x54bccB971FeB8917d80a252D20A1725a6DbE0BE4",
          name: "Digital US Dollar",
          symbol: "USDi",
          icon: `/usd.png`,
        },
        {
          address: "0x30137348b9e8bFFbC476Dcf06A5383150cD3443E",
          name: "Digital Rupee",
          symbol: "INRi",
          icon: `/inr.png`,
        },
      ],
    }}
    theme="dark"
    className={`connect ${onlyBalance ? 'onlyBalance' : 'balance'}`}
  />
  );
};

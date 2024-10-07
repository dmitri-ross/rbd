// components/ConnectBlock.tsx

import { ConnectWallet } from "@thirdweb-dev/react";
import { contractAddresses } from "../../const/contracts";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  useBalance,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";

export const ConnectBlock = ({ symbol = "RUR", onlyBalance = false }) => {
  // Получаем данные пользователя
  const { user, isLoggedIn, isLoading } = useUser();
  const [organizationName, setOrganizationName] = useState("");

  // Функция для обрезки строки
  const truncateString = (str: string, num: number) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  };

  useEffect(() => {
    const userData: any = user;
    if (userData && userData.data) {
      const name = userData.data.organizationName || "";
      setOrganizationName(truncateString(name, 14));
    }
  }, [user]);

  return (
    <>
      <div className="header-organization">
        {organizationName && <span>{organizationName}</span>}
      </div>
      <ConnectWallet
        modalTitleIconUrl={""}
        hideSwitchToPersonalWallet={true}
        displayBalanceToken={{
          137: contractAddresses[symbol],
        }}
        supportedTokens={{
          [137]: [
            {
              address: contractAddresses["RUR"],
              name: "Ruble",
              symbol: "RUR",
              icon: `/RUR.png`,
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
        theme="light"
        className={`connect ${onlyBalance ? "onlyBalance" : "balance"}`}
      />
    </>
  );
};

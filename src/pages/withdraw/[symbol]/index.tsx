// pages/withdraw.tsx

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "@thirdweb-dev/react";
import WithdrawBlock from "@/components/WithdrawBlock";
import { BackButton } from "@/components/BackButton";
export default function Withdraw() {
  
  const router = useRouter();
  const { self } = router.query; // Get 'self' from query parameters
  const isSelf = self === "true"; // Determine if 'self' is true
  const { symbol } = router.query;
  const { isLoggedIn, isLoading } = useUser();

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  return (
    <>
      <div className="dashboard-header">
     
      <BackButton />
        {isSelf ? 
        <h1>Вывод средств {symbol?.toString()}</h1>
        :
        <h1>Новый платеж {symbol?.toString()}</h1>
}
      </div>

      <WithdrawBlock symbol={symbol?.toString()} />
    </>
  );
}

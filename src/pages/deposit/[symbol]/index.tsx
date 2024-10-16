// pages/deposit.tsx

import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUser } from "@thirdweb-dev/react";
import DepositBlock from "@/components/DepositBlock";
import { BackButton } from "@/components/BackButton";
export default function Deposit() {
  const router = useRouter();
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
        <h1>Депозит средств на {symbol}</h1>
      </div>

      <DepositBlock symbol={symbol} />
    </>
  );
}

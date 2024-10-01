// pages/swap.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useUser } from "@thirdweb-dev/react";
import SwapBlock from "@/components/SwapBlock";

const Swap = () => {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useUser();

  useEffect(() => {
    // Redirect logic
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  return (
    <>
      {/* Main Content */}
      <div className="dashboard-header">
        <h1>Покупка/Продажа ИЦП</h1>
      </div>

      <SwapBlock />
    </>
  );
};

export default Swap;

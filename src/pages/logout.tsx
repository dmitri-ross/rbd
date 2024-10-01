// pages/logout.tsx

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDisconnect } from "@thirdweb-dev/react";

const Logout = () => {
  const router = useRouter();
  const disconnect = useDisconnect();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await disconnect(); // Disconnect the wallet
        router.replace("/login"); // Redirect to login page
      } catch (error) {
        console.error("Error during logout:", error);
        router.replace("/login"); // Even if there's an error, redirect
      }
    };

    performLogout();
  }, [disconnect, router]);

  return <p>Выход из системы...</p>; // Optional: Loading indicator
};

export default Logout;

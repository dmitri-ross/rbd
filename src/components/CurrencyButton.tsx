import { Button } from "@nextui-org/react";

import styles from "@/styles/Home.module.css";
import { useRouter } from "next/router";
export const CurrencyButton = ({ contract, index, action }) => {
  const router = useRouter();
  const handleNavigation = (url) => {
    router.push(url);
  };
  return (
    <>
      <Button
        className="light mg-20 navbutton h-50"
        color="default"
        variant="ghost"
        key={index} // Ensure `key` is here
        onClick={() => handleNavigation(`/${action}/${contract.currency}`)}
      >
        <div className={styles.nft}>
          <div className={styles.nftDetails}>
            <h4>
              {contract.metadata.data?.name} ({contract.metadata.data?.symbol})
            </h4>
            {contract.metadata.isLoading && <p>Loading...</p>}
          </div>
        </div>
      </Button>
    </>
  );
};

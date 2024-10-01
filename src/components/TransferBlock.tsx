// components/TransferBlock.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Web3Button, useAddress, useBalance, useSDK } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { contractAddresses, erc20ABI } from "../../const/contracts";
import styles from "@/styles/Transfer.module.css";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

export const TransferBlock = ({ symbol = "RUB" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const tokenAddress = contractAddresses[symbol];
  const address = useAddress();
  const sdk = useSDK();
  const { data: balance } = useBalance(tokenAddress);

  const [to, setToAddress] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [amountInWei, setAmountInWei] = useState("0");
  const [decimals, setDecimals] = useState(18);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (sdk) {
        // Initialize the token contract using the custom ABI
        const tokenContract = await sdk.getContractFromAbi(tokenAddress, erc20ABI);
        const tokenDecimals = await tokenContract.call("decimals");
        setDecimals(tokenDecimals);
      }
    };
    initContract();
  }, [sdk, tokenAddress]);

  useEffect(() => {
    if (inputAmount === "") {
      setAmountInWei("0");
      return;
    }
    if (/^\d*\.?\d*$/.test(inputAmount)) {
      try {
        const weiAmount = ethers.utils.parseUnits(inputAmount, decimals);
        setAmountInWei(weiAmount.toString());
      } catch (error) {
        console.error("Error converting amount to correct decimals:", error);
      }
    }
  }, [inputAmount, decimals]);

  const handleTransfer = async () => {
    if (BigNumber.from(amountInWei).gt(balance.value)) {
      alert("Указанная сумма больше доступного баланса!");
      return;
    }

    if (!to || BigNumber.from(amountInWei).lte(0)) {
      alert("Заполните все поля!");
      return;
    }

    try {
      setIsTransferring(true);
      const tokenContract = await sdk.getContractFromAbi(tokenAddress, erc20ABI);
      await tokenContract.call("transfer", [to, amountInWei]);
      onOpen();
    } catch (error) {
      console.error("Transfer failed:", error);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCloseModal = () => {
    onOpenChange();
    router.push(`/transactions/${symbol}`);
  };

  return (
    <>
      <div className={styles.form}>
        <div className={styles.inputField}>
          <label>Адрес получателя:</label>
          <input
            type="text"
            placeholder="0x123..1234"
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputField}>
          <label>Сумма перевода:</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={inputAmount}
            required
            placeholder={`Укажите сумму (Баланс: ${Number(
              balance?.displayValue || "0"
            ).toFixed(2)})`}
            onChange={(e) => setInputAmount(e.target.value)}
          />
        </div>
      </div>

      <button
        className={styles.transferButton}
        onClick={handleTransfer}
        disabled={isTransferring}
      >
        {isTransferring
          ? "Перевод..."
          : BigNumber.from(amountInWei).gt(0)
          ? "Перевести"
          : "Введите сумму"}
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleCloseModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader  className={styles.modalHeader}>
                Транзакция подтверждена
              </ModalHeader>
              <ModalBody className={styles.modalBody}>
                <p>Транзакция успешно отправлена!</p>
              </ModalBody>
              <ModalFooter className={styles.modalFooter}>
                <Button color="primary" onPress={handleCloseModal}>
                  Закрыть
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

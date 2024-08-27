import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Web3Button, useAddress, useBalance, useSDK } from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { contractAddresses, erc20ABI } from "../../const/contracts"; // Импортируем кастомный ABI

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
        // Используем кастомный ABI для инициализации контракта
        const tokenContract = await sdk.getContractFromAbi(tokenAddress, erc20ABI);
        const tokenDecimals = await tokenContract.call("decimals");
        console.log(tokenDecimals);
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
    if (BigNumber.from(amountInWei).gte(balance.value)) {
      alert("Указанная сумма больше доступного баланса!");
      return;
    }

    if (!to || BigNumber.from(amountInWei).lte(0)) {
      alert("Заполните все поля!");
      return;
    }

    try {
      setIsTransferring(true);
      const tokenContract = await sdk.getContractFromAbi(tokenAddress, erc20ABI); // Используем кастомный ABI
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
      <div className="w-full flex flex-col gap-4">
        <div className="dark flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
          <Input
            className="mg-top-20"
            type="to"
            label="Адрес получателя:"
            placeholder="0x123..1234"
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
          <Input
            className="mg-20"
            type="number"
            step="0.01"
            label="Сумма перевода:"
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
      <Web3Button
        className="checkDis"
        contractAddress={tokenAddress}
        action={handleTransfer}
        isDisabled={isTransferring}
      >
        {isTransferring
          ? "Перевод..."
          : BigNumber.from(amountInWei).gt(0)
          ? "Перевести"
          : "Введите сумму"}
      </Web3Button>

      <Modal
        className="dark"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleCloseModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Транзакция подтверждена
              </ModalHeader>
              <ModalBody>
                <p>Транзакция успешно отправлена!</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleCloseModal}
                >
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

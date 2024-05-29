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
import {
  Web3Button,
  useAddress,
  useBalance,
  useContract,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { contractAddresses } from "../../const/contracts";
import { set } from "mobx";
export const TransferBlock = ({ symbol = "RUB" }) => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const router = useRouter();
  const tokenAddress = contractAddresses[symbol];

  const { contract: tokenContract } = useContract(tokenAddress);
  const address = useAddress();
  const [allowance, setAllowance] = useState(BigNumber.from("0"));

  const { data: balance } = useBalance(tokenAddress);
  const [to, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [inputAmount, setInputAmount] = useState(""); // User's raw input
  const [amountInWei, setAmountInWei] = useState("0");

  useEffect(() => {
    if (inputAmount === "") {
      setAmountInWei("0");
      return;
    }
    if (/^\d*\.?\d*$/.test(inputAmount)) {  // Ensures only valid numeric input is considered
      try {
        const weiAmount = ethers.utils.parseEther(inputAmount);
        setAmountInWei(weiAmount.toString());
      } catch (error) {
        console.error("Error converting amount to wei:", error);
      }
    }
  }, [inputAmount]);

  const handleTransfer = async (contract) => {
   
    if (BigNumber.from(amountInWei).gte(balance.value)) {
      alert("Указанная сумма больше доступного баланса!");
      return;
    }

    if (!to || BigNumber.from(amountInWei).lte(0)) {
      alert("Заполните все поля!");
      return;
    }

    await contract.call("transfer", [to, amountInWei]);
    onOpen();
  };
  const handleCloseModal = () => {
    onOpenChange();
    router.push(`/transactions/${symbol}`);
  };
  return (
    <>
      <>
        <div className="w-full flex flex-col gap-4">
          <div className=" dark flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <Input
              className="mg-top-20"
              type="to"
              label="Адрес получателя:"
              placeholder="0x123..1234"
              onValueChange={setToAddress}
              required
            />
            <Input
              className="mg-20"
              type="number"
              step="0.01"
              label="Сумма перевода:"
              min="1"
              value={inputAmount}
              required
              placeholder={`Укажите сумму (Баланс: ${Number(
                balance?.displayValue || "0"
              ).toFixed(2)})`}
              onValueChange={setInputAmount}
            />
          </div>
        </div>
        <Web3Button
          className="checkDis "
          contractAddress={tokenAddress}
          action={handleTransfer}
        >
          {BigNumber.from(amountInWei).gt(0) ? "Перевести" : "Введите сумму"}
        </Web3Button>
      </>

      <Modal className="dark" isOpen={isOpen} onOpenChange={onOpenChange}  onClose={handleCloseModal}>
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
                <Button color="danger" variant="light" onPress={handleCloseModal}>
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

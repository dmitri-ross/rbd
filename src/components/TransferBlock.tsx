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
import { useEffect, useState } from "react";

import {
  Web3Button,
  useAddress,
  useContract,
  useBalance,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import { contractAddresses } from "../../const/contracts";
export const TransferBlock = ({ symbol = "RUB" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const tokenAddress = contractAddresses[symbol];

  const { contract: tokenContract } = useContract(tokenAddress);
  const address = useAddress();
  const [allowance, setAllowance] = useState(BigNumber.from("0"));

  const { data: balance } = useBalance(tokenAddress);
  const [to, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");

  const handleTransfer = async (contract) => {
    if (!to || BigNumber.from(ethers.utils.parseEther(amount)).lte(0)) {
      alert("Заполните все поля!");
      return;
    }
    const amountInWei = BigNumber.from(
      ethers.utils.parseEther(amount)
    ).toString();
    await contract.call("transfer", [to, BigNumber.from(amountInWei)]);
    onOpen();
  };

  return (
    <>
      {symbol == "RUB" && (
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
                type="deciamal"
                label="Сумма перевода:"
                min="1"
                required
                placeholder={`Укажите сумму (Баланс: ${Number(balance?.displayValue||"0").toFixed(2)})`}
                onValueChange={setAmount}
              />
            </div>
          </div>
          <Web3Button
            className="checkDis "
            contractAddress={tokenAddress}
            action={handleTransfer}
          >
            {BigNumber.from(ethers.utils.parseEther(amount)).gt(0)
              ? "Перевести"
              : "Введите сумму"}
          </Web3Button>
        </>
      )}

      <Modal className="dark" isOpen={isOpen} onOpenChange={onOpenChange}>
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
                <Button color="danger" variant="light" onPress={onClose}>
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

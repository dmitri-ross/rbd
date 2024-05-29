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
import { useState,useEffect } from "react";

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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const tokenAddress = contractAddresses[symbol];

  const { contract: tokenContract } = useContract(tokenAddress);
  const address = useAddress();
  const [allowance, setAllowance] = useState(BigNumber.from("0"));

  const { data: balance } = useBalance(tokenAddress);
  const [to, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");

  useEffect(() => {
    
    const pAmount = parseFloat(amount.substring(0,20)).toString();
    setAmount(pAmount);
  }, [amount]);

  const handleTransfer = async (contract) => {
    const floatAmount = parseFloat(amount||"0").toString();
    const amountInWei = BigNumber.from(
      ethers.utils.parseEther(floatAmount)
    );
    if (!to || amountInWei.lte(0)) {
      alert("Заполните все поля!");
      return;
    }
    
    await contract.call("transfer", [to, amountInWei]);
    onOpen();
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
                type="deciamal"
                label="Сумма перевода:"
                min="1"
                value={amount}
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
            {parseFloat(amount)>0 && BigNumber.from(ethers.utils.parseEther(parseFloat(amount.substring(0,20)).toString())).gt(0)
              ? "Перевести"
              : "Введите сумму"}
          </Web3Button>
        </>
      

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

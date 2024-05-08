import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";

import {
  Web3Button,
  useAddress,
  useContract
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
export const WithdrawBlock = (symbol) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const withdrawContractAddress = "0x0De54BBd383811dC1461D2943e3C5Ab2751414cB";
  const tokenAddress = "0xe546AE1D6c9b8F5B7AE856Da9E9148Db05564B94";

  const { contract: tokenContract } = useContract(tokenAddress);
  const address = useAddress();
  const [allowance, setAllowance] = useState(BigNumber.from("0"));

  const [bankName, setBankName] = useState("");
  const [bik, setBik] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("0");

  async function checkApprove() {
    const allowance = await tokenContract?.call("allowance", [
      address,
      withdrawContractAddress,
    ]);
    console.log(allowance.toString());
    setAllowance(allowance);
  }
  useEffect(() => {
    if (!tokenContract || !address) return;

    checkApprove();
  }, [address, tokenContract]);

  const handleWithdraw = async (contract) => {
    if (
      !bankName ||
      !bik ||
      !accountNumber ||
      BigNumber.from(withdrawAmount).lte(0)
    ) {
      alert("Заполните все поля!");
      return;
    }
    const amountInWei = ethers.utils.parseEther(
      BigNumber.from(withdrawAmount).toString()
    );
    if (allowance.gte(BigNumber.from(amountInWei))) {
      await contract.call("withdrawTokens", [
        tokenAddress,
        BigNumber.from(amountInWei),
        `${bankName}, ${bik}, ${accountNumber}`,
      ]);
      onOpen();
    } else {
      await contract.call("approve", [
        withdrawContractAddress,
        BigNumber.from(amountInWei),
      ]);
      checkApprove();
    }
  };

  return (
    <>
      {symbol.symbol == "RUB" && (
        <div className="w-full flex flex-col gap-4">
          <div className=" dark flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <Input
              className="mg-top-20 "
              type="bankName"
              label="Наименование банка:"
              placeholder="Введите наименование банк"
              onValueChange={setBankName}
            />
            <Input
              type="bik"
              label="БИК:"
              placeholder="Введите БИК"
              required
              onValueChange={setBik}
            />
            <Input
              type="accountNumber"
              label="Расчетный счет (р/с):"
              placeholder="Введите номер счета"
              onValueChange={setAccountNumber}
              required
            />
            <Input
              type="number"
              label="Сумма вывода:"
              min="1"
              required
              placeholder="Укажите сумму"
              onValueChange={setWithdrawAmount}
            />
          </div>
        </div>
      )}

      {symbol.symbol != "RUB" && (
        <div className="w-full flex flex-col gap-4">
          <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <p>
              <h3 className="danger">Временно недоступно! </h3>
              <h4 className="danger">Выберите другую валюту.</h4>
            </p>
          </div>
        </div>
      )}

      <Web3Button
        className="checkDis"
        contractAddress={
          allowance && allowance?.gte(BigNumber.from(withdrawAmount))
            ? withdrawContractAddress
            : tokenAddress
        }
        action={handleWithdraw}
        onSuccess={async () => {
          console.log("Approved");
          await checkApprove();
        }}
      >
        {allowance && allowance?.gte(BigNumber.from(withdrawAmount))
          ? "Подтвердить вывод (2/2)"
          : "Разрешить расходование (1/2)"}
      </Web3Button>
      <Modal className="dark" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Транзакция подтверждена
              </ModalHeader>
              <ModalBody>
                <p>
                  Транзакция успешно отправлена! Ожидайте поступления средств.
                </p>
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

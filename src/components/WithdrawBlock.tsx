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
  contractAddresses,
  withdrawContractAddress,
  erc20ABI,
} from "../../const/contracts";
import CryptoJS from "crypto-js";
import {
  Web3Button,
  useAddress,
  useBalance,
  useContract,
  useContractWrite,
  useSDK,
  useUser,
} from "@thirdweb-dev/react";
import axios from "axios";
import { useRouter } from "next/router";
import { BigNumber, ethers } from "ethers";

export const WithdrawBlock = ({ symbol = "RUB" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const tokenAddress = contractAddresses[symbol];
  const address = useAddress();
  const sdk = useSDK(); // Получаем SDK из thirdweb
  const { contract: withdrawContract } = useContract(withdrawContractAddress);
  const { data: balance } = useBalance(contractAddresses[symbol]);

  const [allowance, setAllowance] = useState(BigNumber.from("0"));
  const [dots, setDots] = useState(""); // Состояние для точек
  const [tokenContract, setTokenContract] = useState(null); // Состояние для контракта

  // Инициализация контракта через Thirdweb SDK с кастомным ABI
  useEffect(() => {
    const initContract = async () => {
      const contract = await sdk.getContractFromAbi(tokenAddress, erc20ABI);
      setTokenContract(contract);
    };
    if (sdk) {
      initContract();
    }
  }, [sdk, tokenAddress]);

  const fetchAllowance = async () => {
    try {
      if (tokenContract) {
        const result = await tokenContract.call("allowance", [
          address,
          withdrawContractAddress,
        ]);

        setAllowance(BigNumber.from(result));
      }
    } catch (error) {
      console.error("Error fetching allowance:", error);
    }
  };

  useEffect(() => {
    if (address && tokenContract) {
      fetchAllowance();
    }
  }, [address, tokenContract]);

  // Хук для вызова функции approve
  const {
    mutate: approve,
    isLoading: isApproving,
    error: approveError,
  } = useContractWrite(tokenContract, "approve");

  // Хук для вызова функции withdrawTokens
  const {
    mutate: withdrawTokens,
    isLoading: isWithdrawing,
    error: withdrawError,
  } = useContractWrite(withdrawContract, "withdrawTokens");

  useEffect(() => {
    let interval;
    if (isApproving || isWithdrawing) {
      interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : ""));
      }, 500);
    } else {
      setDots("");
    }
    return () => clearInterval(interval);
  }, [isApproving, isWithdrawing]);

  const [bankName, setBankName] = useState("");
  const [bik, setBik] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [inputAmount, setInputAmount] = useState(""); // User's raw input
  const [withdrawAmount, setWithdrawAmount] = useState("0"); // Validated number for calculations
  const [amountInWei, setAmountInWei] = useState("0");

  useEffect(() => {
    if (inputAmount === "") {
      setAmountInWei("0");
      return;
    }
    if (/^\d*\.?\d*$/.test(inputAmount)) {
      try {
        const weiAmount = ethers.utils.parseEther(inputAmount);
        setAmountInWei(weiAmount.toString());

        // Перезапрашиваем allowance каждый раз при изменении суммы
        fetchAllowance();
      } catch (error) {
        console.error("Error converting amount to wei:", error);
      }
    }
  }, [inputAmount]);

  const sendTransactionDetailsToAPI = async (transactionDetails) => {
    try {
      const response = await axios.post("/api/transaction-success", {
        data: transactionDetails,
      });
      console.log("API response:", response.data);
    } catch (error) {
      console.error("Error sending transaction details:", error);
    }
  };

  const handleWithdraw = async () => {
    const finputAmount = inputAmount;
    if (BigNumber.from(amountInWei).gte(balance.value)) {
      alert("Указанная сумма больше доступного баланса!");
      return;
    }
    if (
      !bankName ||
      !bik ||
      !accountNumber ||
      BigNumber.from(amountInWei).lte(0)
    ) {
      alert("Заполните все поля!");
      return;
    }

    if (allowance.gte(BigNumber.from(amountInWei))) {
      const concatenatedDetails = `${bankName}, ${bik}, ${accountNumber}`;

      const encryptedDetails = CryptoJS.AES.encrypt(
        concatenatedDetails,
        "enkey"
      ).toString();

      // Вызываем функцию withdrawTokens через хук
      withdrawTokens(
        {
          args: [tokenAddress, BigNumber.from(amountInWei), encryptedDetails],
        },
        {
          onSuccess: async (tx) => {
            await sendTransactionDetailsToAPI({
              sender: address,
              symbol,
              tokenAddress,
              amount: finputAmount,
              bankName,
              bik,
              accountNumber,
              txHash: tx?.receipt?.transactionHash || "0x",
            });
            onOpen();
          },
          onError: (error) => {
            console.error("Withdraw failed:", error);
          },
        }
      );
    } else {
      // Вызываем функцию approve через хук
      approve(
        {
          args: [withdrawContractAddress, amountInWei],
        },
        {
          onSuccess: () => {
            fetchAllowance(); // Обновляем allowance после успешного approve
          },
          onError: (error) => {
            console.error("Approval failed:", error);
          },
        }
      );
    }
  };

  const handleCloseModal = () => {
    onOpenChange();
    router.push(`/transactions/${symbol}`);
  };

  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [isApproved, setUserIsApproved] = useState(false);
  useEffect(() => {
    const userDatawithData: any = user;
    if (userDatawithData && userDatawithData.data) {
      setUserId(userDatawithData.data.userId);
      setUserIsApproved(userDatawithData.data.isApproved);
      console.log(symbol, isApproved);
    }
  }, [user]);

  return (
    <>
      {symbol == "RUB" && isApproved && (
        <>
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
                className="mg-20"
                type="number"
                step="0.01"
                label="Сумма вывода:"
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
            className="checkDis"
            contractAddress={
              allowance && allowance?.gte(BigNumber.from(amountInWei))
                ? withdrawContractAddress
                : tokenAddress
            }
            action={handleWithdraw}
            isDisabled={isApproving || isWithdrawing} // Блокируем кнопку, если происходит approve или withdraw
          >
            {isApproving || isWithdrawing
              ? `Идет подтверждение транзакции${dots}` // Текст с меняющимся количеством точек
              : BigNumber.from(amountInWei).gt(0)
              ? allowance && allowance?.gte(BigNumber.from(amountInWei))
                ? "Подтвердить вывод (2/2)"
                : "Разрешить расходование (1/2)"
              : "Введите сумму"}
          </Web3Button>
        </>
      )}

      {!isApproved && (
        <div className="w-full flex flex-col gap-4">
          <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <div>
              <h4 className="danger">
                Платформа работает в тестовом режиме. Для получения возможности
                пополнения счета обратитесь к администратору
                admin@stableunion.org.
              </h4>
            </div>
          </div>
        </div>
      )}

      {symbol != "RUB" && isApproved && (
        <div className="w-full flex flex-col gap-4">
          <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <p>
              <h3 className="danger">Временно недоступно! </h3>
              <h4 className="danger">Выберите другую валюту.</h4>
            </p>
          </div>
        </div>
      )}

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
                <p>
                  Транзакция успешно отправлена! Ожидайте поступления средств.
                </p>
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

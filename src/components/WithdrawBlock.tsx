// components/WithdrawBlock.tsx

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

const WithdrawBlock = ({ symbol = "RUB" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const { self } = router.query; // Get 'self' from query parameters
  const isSelf = self === "true"; // Determine if 'self' is true
  const tokenAddress = contractAddresses[symbol];
  const address = useAddress();
  const sdk = useSDK();
  const { contract: withdrawContract } = useContract(withdrawContractAddress);
  const { data: balance } = useBalance(contractAddresses["RUB"]); // Fetch RUB balance

  const [allowance, setAllowance] = useState(BigNumber.from("0"));
  const [dots, setDots] = useState("");
  const [tokenContract, setTokenContract] = useState(null);

  // Initialize contract
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

  // Hooks for approve and withdrawTokens
  const {
    mutate: approve,
    isLoading: isApproving,
    error: approveError,
  } = useContractWrite(tokenContract, "approve");

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

  // New state variables
  const [selectedCountry, setSelectedCountry] = useState("RU"); // Default to Russia
  const [inputCurrency, setInputCurrency] = useState("RUB"); // Default to RUB
  const [inputAmountForeign, setInputAmountForeign] = useState(""); // Amount in foreign currency
  const [exchangeRate, setExchangeRate] = useState(1); // Exchange rate to RUB
  const [calculatedAmountRUB, setCalculatedAmountRUB] = useState("0"); // Amount in RUB

  // Define countries and currencies
  const countries = [
    { code: "RU", name: "Россия", currency: "RUB" },
    { code: "CN", name: "Китай", currency: "CNY" },
    { code: "AE", name: "ОАЭ", currency: "AED" },
    { code: "TR", name: "Турция", currency: "TRY" },
  ];

  // Exchange rates to RUB
  const exchangeRates = {
    RUB: 1, // 1 RUB = 1 RUB
    CNY: 14, // 1 CNY = 14 RUB
    AED: 20, // 1 AED = 20 RUB
    TRY: 3, // 1 TRY = 3 RUB
  };

  // Update exchange rate based on selected currency
  useEffect(() => {
    const country = countries.find((c) => c.code === selectedCountry);
    setInputCurrency(country?.currency || "RUB");
    setExchangeRate(exchangeRates[country?.currency || "RUB"] || 1);
  }, [selectedCountry]);

  // Bank details fields
  const [bankName, setBankName] = useState("");
  const [bik, setBik] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [paymentPurpose, setPaymentPurpose] = useState("");
  const [documentLink, setDocumentLink] = useState("");

  // Amount in RUB in Wei
  const [amountInWei, setAmountInWei] = useState("0");

  // Calculate amount in RUB when inputAmountForeign changes
  useEffect(() => {
    if (inputAmountForeign === "") {
      setCalculatedAmountRUB("0");
      setAmountInWei("0");
      return;
    }
    if (/^\d*\.?\d*$/.test(inputAmountForeign)) {
      try {
        const amountRUB = (
          parseFloat(inputAmountForeign) * exchangeRate
        ).toFixed(2);
        setCalculatedAmountRUB(amountRUB);

        const weiAmount = ethers.utils.parseEther(amountRUB);
        setAmountInWei(weiAmount.toString());

        fetchAllowance();
      } catch (error) {
        console.error("Error converting amount:", error);
      }
    }
  }, [inputAmountForeign, exchangeRate]);

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
    const finputAmount = calculatedAmountRUB;
    if (BigNumber.from(amountInWei).gt(balance.value)) {
      alert("Указанная сумма больше доступного баланса!");
      return;
    }

    // Validate required fields based on selected country
    let bankDetails = "";
    if (selectedCountry === "RU") {
      if (!bankName || !bik || !accountNumber) {
        alert("Заполните все поля банковских реквизитов!");
        return;
      }
      bankDetails = `Страна: ${selectedCountry}, Банк: ${bankName}, БИК: ${bik}, Счет: ${accountNumber}`;
    } else if (selectedCountry === "CN") {
      if (!bankName || !swiftCode || !accountNumber) {
        alert("Заполните все поля банковских реквизитов!");
        return;
      }
      bankDetails = `Страна: ${selectedCountry}, Банк: ${bankName}, SWIFT: ${swiftCode}, Счет: ${accountNumber}`;
    } else if (selectedCountry === "AE" || selectedCountry === "TR") {
      if (!bankName || !iban) {
        alert("Заполните все поля банковских реквизитов!");
        return;
      }
      bankDetails = `Страна: ${selectedCountry}, Банк: ${bankName}, IBAN: ${iban}`;
    }

    if (BigNumber.from(amountInWei).lte(0)) {
      alert("Введите корректную сумму!");
      return;
    }

    // Validate payment purpose
    if (!paymentPurpose) {
      alert("Укажите назначение платежа!");
      return;
    }

    if (allowance.gte(BigNumber.from(amountInWei))) {
      const concatenatedDetails = `${bankDetails}, Назначение платежа: ${paymentPurpose}, Ссылка на документы: ${documentLink}`;

      const encryptedDetails = CryptoJS.AES.encrypt(
        concatenatedDetails,
        "enkey"
      ).toString();

      // Call withdrawTokens
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
              swiftCode,
              iban,
              country: selectedCountry,
              paymentPurpose,
              documentLink,
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
      // Call approve
      approve(
        {
          args: [withdrawContractAddress, amountInWei],
        },
        {
          onSuccess: () => {
            fetchAllowance();
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
    }
  }, [user]);

  // Effect to set values based on 'self' parameter
  useEffect(() => {
    if (isSelf) {
      setSelectedCountry("RU");
    }
  }, [isSelf]);

  // Effect to set pre-filled payment purpose when 'self' is true
  useEffect(() => {
    if (isSelf && userId) {
      setPaymentPurpose(
        `Вывод средств на расчетный счет по договору оферты №1000${userId} от 17.06.2024`
      );
    }
  }, [isSelf, userId]);

  return (
    <>
      {symbol == "RUB" && isApproved && (
        <>
          <div className="withdraw-container">
            {/* Display RUB balance */}
            <div className="balance-info">
              <p>
                Ваш баланс: {Number(balance?.displayValue || "0").toFixed(2)} RUB
              </p>
            </div>

            {/* Conditionally render country selection */}
            {!isSelf && (
              <div className="field-group">
                <label>Выберите страну:</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount input */}
            <div className="field-group">
              <label>Сумма вывода ({inputCurrency}):</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={inputAmountForeign}
                required
                placeholder={`Введите сумму в ${inputCurrency}`}
                onChange={(e) => setInputAmountForeign(e.target.value)}
              />
            </div>

            {/* Calculated RUB amount */}
            <div className="field-group">
              <label>Сумма в рублях (RUB):</label>
              <Input type="text" value={calculatedAmountRUB} disabled />
            </div>

            {/* Payment Purpose */}
            {isSelf ? (
              <div className="field-group">
                <label>Назначение платежа:</label>
                <p>{paymentPurpose}</p>
              </div>
            ) : (
              <div className="field-group">
                <label>Назначение платежа:</label>
                <Input
                  type="text"
                  placeholder="Введите назначение платежа"
                  value={paymentPurpose}
                  onChange={(e) => setPaymentPurpose(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Document Link */}
            <div className="field-group">
              <label>Ссылка на документы (при необходимости):</label>
              <Input
                type="text"
                placeholder="Введите ссылку на документы"
                onChange={(e) => setDocumentLink(e.target.value)}
              />
            </div>

            {/* Bank details based on country */}
            {selectedCountry === "RU" && (
              <>
                <div className="field-group">
                  <label>Наименование банка:</label>
                  <Input
                    type="text"
                    placeholder="Введите наименование банка"
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>БИК:</label>
                  <Input
                    type="text"
                    placeholder="Введите БИК"
                    onChange={(e) => setBik(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Расчетный счет:</label>
                  <Input
                    type="text"
                    placeholder="Введите номер счета"
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </>
            )}
            {selectedCountry === "CN" && (
              <>
                <div className="field-group">
                  <label>Наименование банка:</label>
                  <Input
                    type="text"
                    placeholder="Введите наименование банка"
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>SWIFT код:</label>
                  <Input
                    type="text"
                    placeholder="Введите SWIFT код"
                    onChange={(e) => setSwiftCode(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Номер счета:</label>
                  <Input
                    type="text"
                    placeholder="Введите номер счета"
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>
              </>
            )}
            {(selectedCountry === "AE" || selectedCountry === "TR") && (
              <>
                <div className="field-group">
                  <label>Наименование банка:</label>
                  <Input
                    type="text"
                    placeholder="Введите наименование банка"
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>IBAN:</label>
                  <Input
                    type="text"
                    placeholder="Введите IBAN"
                    onChange={(e) => setIban(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Withdraw Button */}
            <Web3Button
              className="withdraw-button"
              contractAddress={
                allowance && allowance?.gte(BigNumber.from(amountInWei))
                  ? withdrawContractAddress
                  : tokenAddress
              }
              action={handleWithdraw}
              isDisabled={isApproving || isWithdrawing}
            >
              {isApproving || isWithdrawing
                ? `Идет подтверждение транзакции${dots}`
                : BigNumber.from(amountInWei).gt(0)
                ? allowance && allowance?.gte(BigNumber.from(amountInWei))
                  ? "Подтвердить вывод (2/2)"
                  : "Разрешить расходование (1/2)"
                : "Введите сумму"}
            </Web3Button>
          </div>
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
              <h3 className="danger">Временно недоступно!</h3>
              <h4 className="danger">Выберите другую валюту.</h4>
            </p>
          </div>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleCloseModal}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="fixed-modeal-header">
                Транзакция подтверждена
              </ModalHeader>
              <ModalBody>
                <p>
                  Транзакция успешно отправлена! Ожидайте поступления средств.
                </p>
              </ModalBody>
              <ModalFooter>
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

export default WithdrawBlock;

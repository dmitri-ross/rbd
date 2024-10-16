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

const WithdrawBlock = ({ symbol = "RUR" }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const { self } = router.query; // Получаем параметр 'self' из маршрута
  const isSelf = self === "true"; // Определяем, является ли 'self' истинным
  const tokenAddress = contractAddresses[symbol];
  const address = useAddress();
  const sdk = useSDK();
  const { contract: withdrawContract } = useContract(withdrawContractAddress);
  const { data: balance } = useBalance(tokenAddress); // Получаем баланс выбранного токена

  const [dots, setDots] = useState("");
  const [tokenContract, setTokenContract] = useState(null);

  // Инициализация контракта
  useEffect(() => {
    const initContract = async () => {
      const contract = await sdk.getContractFromAbi(tokenAddress, erc20ABI);
      setTokenContract(contract);
    };
    if (sdk) {
      initContract();
    }
  }, [sdk, tokenAddress]);

  // Хуки для approve и withdrawTokens
  const {
    mutateAsync: approve,
    isLoading: isApproving,
    error: approveError,
  } = useContractWrite(tokenContract, "approve");

  const {
    mutateAsync: withdrawTokens,
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

  // Состояния для формы
  const [selectedCountry, setSelectedCountry] = useState("RU"); // По умолчанию Россия
  const [inputCurrency, setInputCurrency] = useState("RUR"); // По умолчанию RUR
  const [inputAmountForeign, setInputAmountForeign] = useState(""); // Сумма в иностранной валюте
  const [exchangeRate, setExchangeRate] = useState(1); // Курс обмена к выбранному токену
  const [calculatedAmountToken, setCalculatedAmountToken] = useState("0"); // Сумма в выбранном токене

  // Определяем страны и валюты
  const countries = [
    { code: "RU", name: "Россия", currency: "RUR" },
    { code: "CN", name: "Китай", currency: "CNY" },
    { code: "AE", name: "ОАЭ", currency: "AED" },
    { code: "TR", name: "Турция", currency: "TRY" },
  ];

  // Курсы обмена к выбранному токену
  const exchangeRates = {
    RUR: {
      RUR: 1,
      CNY: 14, // 1 CNY = 14 RUR
      AED: 20, // 1 AED = 20 RUR
      TRY: 3,  // 1 TRY = 3 RUR
    },
    USDT: {
      RUR: 0.01,
      CNY: 0.142857, // 1 CNY = 0.142857 USDT (1 USDT = 7 CNY)
      AED: 0.27248,  // 1 AED = 0.27248 USDT (1 USDT = 3.67 AED)
      TRY: 0.037037, // 1 TRY = 0.037037 USDT (1 USDT = 27 TRY)
    },
    USDC: {
      RUR: 0.01,
      CNY: 0.142857,
      AED: 0.27248,
      TRY: 0.037037,
    },
    RUBi: {
      RUR: 1,
      CNY: 14,
      AED: 20,
      TRY: 3,
    },
  };

  // Обновление курса обмена при изменении страны или символа
  useEffect(() => {
    const country = countries.find((c) => c.code === selectedCountry);
    const currency = country?.currency || "RUR";
    setInputCurrency(currency);
    setExchangeRate(exchangeRates[symbol][currency] || 1);
  }, [selectedCountry, symbol]);

  // Поля банковских реквизитов
  const [bankName, setBankName] = useState("");
  const [bik, setBik] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [iban, setIban] = useState("");
  const [paymentPurpose, setPaymentPurpose] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Сумма в выбранном токене в Wei
  const [amountInWei, setAmountInWei] = useState("0");

  // Расчет суммы в выбранном токене при изменении inputAmountForeign
  useEffect(() => {
    if (inputAmountForeign === "") {
      setCalculatedAmountToken("0");
      setAmountInWei("0");
      return;
    }
    if (/^\d*\.?\d*$/.test(inputAmountForeign)) {
      try {
        const amountToken = (
          parseFloat(inputAmountForeign) * exchangeRate
        ).toFixed(6); // Настройте количество знаков после запятой по необходимости
        setCalculatedAmountToken(amountToken);

        const decimals = balance?.decimals || 18;
        const weiAmount = ethers.utils.parseUnits(amountToken, decimals);
        setAmountInWei(weiAmount.toString());
      } catch (error) {
        console.error("Error converting amount:", error);
      }
    }
  }, [inputAmountForeign, exchangeRate, balance]);

  const sendTransactionDetailsToAPI = async (transactionDetails) => {
    try {
      const formData = new FormData();
      for (const key in transactionDetails) {
        formData.append(key, transactionDetails[key]);
      }
      if (documentFile) {
        formData.append("document", documentFile);
      }
      // Добавляем документы из дополнительных полей
      if (documents && documents.length > 0) {
        documents.forEach((doc, index) => {
          formData.append(`document_${index}`, doc);
        });
      }

      const response = await axios.post("/api/transaction-success", formData);
      console.log("API response:", response.data);
    } catch (error) {
      console.error("Error sending transaction details:", error);
    }
  };

  const handleWithdraw = async () => {
    const finputAmount = calculatedAmountToken;
    if (BigNumber.from(amountInWei).gt(balance.value)) {
      alert("Указанная сумма больше доступного баланса!");
      return;
    }

    // Проверяем обязательные поля банковских реквизитов
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

    // Проверяем назначение платежа
    if (!paymentPurpose) {
      alert("Укажите назначение платежа!");
      return;
    }

    // Если нужны дополнительные данные
    let additionalInfo = "";
    if (isSelf === false && isApproved === false) {
      if (
        !organizationName ||
        !inn ||
        !kpp ||
        !legalAddress ||
        !actualAddress ||
        !contactPerson ||
        !phone ||
        !email
      ) {
        alert("Заполните все дополнительные поля!");
        return;
      }
      additionalInfo = `Организация: ${organizationName}, ИНН: ${inn}, КПП: ${kpp}, Юр. адрес: ${legalAddress}, Факт. адрес: ${actualAddress}, Контактное лицо: ${contactPerson}, Телефон: ${phone}, Email: ${email}`;
    }

    // Подготавливаем данные для вызова контракта
    const concatenatedDetails = `${bankDetails}, Назначение платежа: ${paymentPurpose}, ${additionalInfo}`;

    const encryptedDetails = CryptoJS.AES.encrypt(
      concatenatedDetails,
      "enkey"
    ).toString();

    // Последовательное выполнение approve и withdraw
    try {
      // Одобряем контракт на списание токенов (неограниченный лимит)
      await approve({
        args: [withdrawContractAddress, ethers.constants.MaxUint256],
      });
      console.log("Approval successful");

      // Вызываем withdrawTokens
      const tx = await withdrawTokens({
        args: [tokenAddress, BigNumber.from(amountInWei), encryptedDetails],
      });

      console.log("Withdrawal successful");

      // Отправляем детали транзакции на API
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
        txHash: tx.receipt.transactionHash,
        // Дополнительные данные
        organizationName,
        inn,
        kpp,
        legalAddress,
        actualAddress,
        contactPerson,
        phone,
        email,
      });

      onOpen();
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  const handleCloseModal = () => {
    onOpenChange();
    router.push(`/?currency=${symbol}`);
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

  // Устанавливаем значения на основе параметра 'self'
  useEffect(() => {
    if (isSelf) {
      setSelectedCountry("RU");
    }
  }, [isSelf]);

  // Предзаполняем назначение платежа, когда 'self' равно true
  useEffect(() => {
    if (isSelf && userId) {
      setPaymentPurpose(
        `Вывод средств на расчетный счет по договору оферты №1000${userId} от 17.06.2024`
      );
    }
  }, [isSelf, userId]);

  // Определяем, разрешен ли вывод средств
  const canWithdraw =
    (symbol === "RUR" && isSelf === true) ||
    (["USDT", "USDC", "RUBi"].includes(symbol) && isSelf === false);

  // Дополнительные поля, если isSelf == false и isApproved == false
  const [organizationName, setOrganizationName] = useState("");
  const [inn, setInn] = useState("");
  const [kpp, setKpp] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [actualAddress, setActualAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  return (
    <>
      {canWithdraw && (
        <div className="withdraw-container">
         
          {/* Отображаем баланс */}
          <div className="balance-info">
            <p>
              Ваш баланс: {Number(balance?.displayValue || "0").toFixed(6)}{" "}
              {symbol}
            </p>
          </div>

          {/* Выбор страны */}
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

          {/* Сумма вывода */}
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

          {/* Рассчитанная сумма в токене */}
          <div className="field-group">
            <label>Сумма в {symbol}:</label>
            <Input type="text" value={calculatedAmountToken} disabled />
          </div>

          {/* Назначение платежа */}
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

          {/* Загрузка документа */}
          <div className="field-group">
            <label>Загрузите документ (при необходимости):</label>
            <input
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setDocumentFile(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* Банковские реквизиты */}
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

          {/* Дополнительные поля, если isSelf == false и isApproved == false */}
          {isSelf === false && isApproved === false && (
            <>
            <hr/>
              <h3 className="text-large py-4"><b>Дополнительная информация о плательщике:</b></h3>
              <div className="field-group">
                <label>Название организации:</label>
                <Input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>ИНН:</label>
                <Input
                  type="text"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>КПП:</label>
                <Input
                  type="text"
                  value={kpp}
                  onChange={(e) => setKpp(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Юридический адрес:</label>
                <Input
                  type="text"
                  value={legalAddress}
                  onChange={(e) => setLegalAddress(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Фактический адрес:</label>
                <Input
                  type="text"
                  value={actualAddress}
                  onChange={(e) => setActualAddress(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Контактное лицо:</label>
                <Input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Телефон:</label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Email:</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Загрузите документы:</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf, .jpg, .jpeg, .png"
                  onChange={(e) => {
                    if (e.target.files) {
                      setDocuments(Array.from(e.target.files));
                    }
                  }}
                />

              </div>
              <hr className="py-2"/>
            </>
          )}

          {/* Кнопка вывода средств */}
          <Web3Button
            className="withdraw-button"
            contractAddress={tokenAddress}
            action={handleWithdraw}
            isDisabled={isApproving || isWithdrawing}
          >
            {isApproving || isWithdrawing
              ? `Идет подтверждение транзакции${dots}`
              : BigNumber.from(amountInWei).gt(0)
              ? "Сделать платеж"
              : "Введите сумму"}
          </Web3Button>
        </div>
      )}

      {!canWithdraw && (
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

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
  Textarea,
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

const WithdrawBlock = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const { self } = router.query;
  const isSelf = self === "true";
  const address = useAddress();
  const sdk = useSDK();
  const { contract: withdrawContract } = useContract(withdrawContractAddress);

  // Способы оплаты
  const paymentMethods = [
    { code: "RUR", name: "Баланс RUR" },
    { code: "USDT", name: "Баланс USDT" },
    { code: "USDC", name: "Баланс USDC" },
    { code: "RUBi", name: "Баланс RUBi" },
    { code: "INVOICE", name: "Выставлением счета в рублях" },
  ];

  // Инициализируем selectedPaymentMethod
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("RUR");

  // Обновляем selectedPaymentMethod на основе маршрута или isSelf
  useEffect(() => {
    if (router.isReady) {
      const { symbol } = router.query;
      if (isSelf) {
        setSelectedPaymentMethod("RUR");
      } else if (symbol) {
        setSelectedPaymentMethod(symbol.toString().toUpperCase());
      }
    }
  }, [router.isReady, router.query, isSelf]);

  const tokenAddresses = {
    RUR: contractAddresses["RUR"],
    USDT: contractAddresses["USDT"],
    USDC: contractAddresses["USDC"],
    RUBi: contractAddresses["RUBi"],
  };

  const [tokenContract, setTokenContract] = useState(null);

  // Получаем контракты токенов
  useEffect(() => {
    const initContract = async () => {
      const contract = await sdk.getContractFromAbi(
        tokenAddresses[selectedPaymentMethod === "INVOICE" ? "RUR" : selectedPaymentMethod],
        erc20ABI
      );
      setTokenContract(contract);
    };
    if (sdk && selectedPaymentMethod) {
      initContract();
    }
  }, [sdk, selectedPaymentMethod]);

  // Получаем балансы токенов
  const { data: balanceRUR } = useBalance(tokenAddresses["RUR"]);
  const { data: balanceUSDT } = useBalance(tokenAddresses["USDT"]);
  const { data: balanceUSDC } = useBalance(tokenAddresses["USDC"]);
  const { data: balanceRUBi } = useBalance(tokenAddresses["RUBi"]);

  const balances = {
    RUR: balanceRUR,
    USDT: balanceUSDT,
    USDC: balanceUSDC,
    RUBi: balanceRUBi,
  };

  const balance =
    selectedPaymentMethod !== "INVOICE"
      ? balances[selectedPaymentMethod]
      : balances["RUR"];

  const tokenAddress =
    selectedPaymentMethod !== "INVOICE"
      ? tokenAddresses[selectedPaymentMethod]
      : tokenAddresses["RUR"];

  // Хуки для approve и withdrawTokens
  const {
    mutateAsync: approve,
    isLoading: isApproving,
  } = useContractWrite(tokenContract, "approve");

  const {
    mutateAsync: withdrawTokens,
    isLoading: isWithdrawing,
  } = useContractWrite(withdrawContract, "withdrawTokens");

  const [dots, setDots] = useState("");

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
  const [selectedCurrency, setSelectedCurrency] = useState("RUB");
  const [inputCurrency, setInputCurrency] = useState("RUB");
  const [inputAmountForeign, setInputAmountForeign] = useState("");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [calculatedAmountToken, setCalculatedAmountToken] = useState("0");
  const [amountToPay, setAmountToPay] = useState("");

  // Валюты
  const currencies = [
    { code: "RUB", name: "Российский рубль", symbol: "₽" },
    { code: "CNY", name: "Китайский юань", symbol: "¥" },
    { code: "USD", name: "Доллар США", symbol: "$" },
  ];

  // Курсы обмена
  const exchangeRates = {
    RUR: {
      RUB: 1,
      CNY: 14,
      USD: 100,
    },
    USDT: {
      RUB: 0.01,
      CNY: 0.14,
      USD: 1,
    },
    USDC: {
      RUB: 0.01,
      CNY: 0.14,
      USD: 1,
    },
    RUBi: {
      RUB: 1,
      CNY: 14,
      USD: 100,
    },
  };

  // Обновление курса обмена
  useEffect(() => {
    const currency = selectedCurrency || "RUB";
    setInputCurrency(currency);
    const rate =
      exchangeRates[selectedPaymentMethod === "INVOICE" ? "RUR" : selectedPaymentMethod]?.[
        currency
      ] || 1;
    setExchangeRate(rate);
  }, [selectedCurrency, selectedPaymentMethod]);

  // Поля банковских реквизитов
  const [beneficiaryType, setBeneficiaryType] = useState("Business");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [swiftOrBik, setSwiftOrBik] = useState("");
  const [email, setEmail] = useState("");
  const [addressField, setAddressField] = useState("");
  const [paymentPurpose, setPaymentPurpose] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Сумма в Wei
  const [amountInWei, setAmountInWei] = useState("0");

  // Расчет сумм
  useEffect(() => {
    if (inputAmountForeign === "") {
      setCalculatedAmountToken("0");
      setAmountInWei("0");
      setAmountToPay("");
      return;
    }

    if (/^\d*\.?\d*$/.test(inputAmountForeign)) {
      const currency = selectedCurrency || "RUB";
      const rate =
        exchangeRates["RUR"]?.[currency] !== undefined
          ? exchangeRates["RUR"][currency]
          : 1;

      const amountInRub = parseFloat(inputAmountForeign) * rate;
      setAmountToPay(amountInRub.toFixed(2));

      if (selectedPaymentMethod !== "INVOICE") {
        try {
          const amountToken = (
            parseFloat(inputAmountForeign) * exchangeRate
          ).toFixed(6);
          setCalculatedAmountToken(amountToken);

          const decimals = balance?.decimals || 18;
          const weiAmount = ethers.utils.parseUnits(amountToken, decimals);
          setAmountInWei(weiAmount.toString());
        } catch (error) {
          console.error("Error converting amount:", error);
        }
      } else {
        // Для INVOICE устанавливаем сумму токена и Wei в 0
        setCalculatedAmountToken("0");
        setAmountInWei("0");
      }
    }
  }, [
    inputAmountForeign,
    exchangeRate,
    balance,
    selectedPaymentMethod,
    selectedCurrency,
  ]);

  const sendTransactionDetailsToAPI = async (transactionDetails) => {
    try {
      const formData = new FormData();

      // Основные поля
      formData.append("sender", transactionDetails.sender);
      formData.append("symbol", transactionDetails.symbol);
      formData.append("tokenAddress", transactionDetails.tokenAddress || "");
      formData.append("amount", transactionDetails.amount || "");
      formData.append("amountToPay", transactionDetails.amountToPay || "");
      formData.append("inputAmountForeign", transactionDetails.inputAmountForeign || "");
      formData.append("selectedCurrency", transactionDetails.selectedCurrency || "");

      // Банковские реквизиты
      formData.append("beneficiaryType", transactionDetails.beneficiaryType || "");
      formData.append("accountName", transactionDetails.accountName || "");
      formData.append("accountNumber", transactionDetails.accountNumber || "");
      formData.append("bankName", transactionDetails.bankName || "");
      formData.append("swiftOrBik", transactionDetails.swiftOrBik || "");
      formData.append("email", transactionDetails.email || "");
      formData.append("addressField", transactionDetails.addressField || "");
      formData.append("paymentPurpose", transactionDetails.paymentPurpose || "");

      // Хэш транзакции
      if (transactionDetails.txHash) {
        formData.append("txHash", transactionDetails.txHash);
      }

      // Организационные данные
      if (!isSelf && !isApproved) {
        formData.append("organizationName", transactionDetails.organizationName || "");
        formData.append("inn", transactionDetails.inn || "");
        formData.append("kpp", transactionDetails.kpp || "");
        formData.append("legalAddress", transactionDetails.legalAddress || "");
        formData.append("actualAddress", transactionDetails.actualAddress || "");
        formData.append("contactPerson", transactionDetails.contactPerson || "");
        formData.append("phone", transactionDetails.phone || "");
      }

      // Документы
      if (transactionDetails.documentFile) {
        formData.append("document", transactionDetails.documentFile);
      }
      if (transactionDetails.documents && transactionDetails.documents.length > 0) {
        transactionDetails.documents.forEach((doc, index) => {
          formData.append(`document_${index}`, doc);
        });
      }

      const response = await axios.post("/api/transaction-success", formData);
      console.log("API response:", response.data);
      onOpen(); // Открываем модальное окно после успешной отправки
    } catch (error) {
      console.error("Error sending transaction details:", error);
      alert("Произошла ошибка при отправке данных. Пожалуйста, попробуйте снова.");
    }
  };

  const handleWithdraw = async () => {
    if (selectedPaymentMethod === "INVOICE") {
      // Для INVOICE инициализируем транзакцию с суммой 0 RUR
      try {
        const tx = await withdrawTokens({
          args: [
            tokenAddress,
            BigNumber.from("0"),
            CryptoJS.AES.encrypt(
              `Тип получателя: ${beneficiaryType}, Наименование счета: ${accountName}, Номер счета: ${accountNumber}, Банк: ${bankName}, ${
                selectedCurrency === "RUB" ? "БИК" : "SWIFT/BIC"
              }: ${swiftOrBik}, Email: ${email}, Адрес: ${addressField}, Назначение платежа: ${paymentPurpose}`,
              "enkey"
            ).toString(),
          ],
        });

        const txHash = tx.receipt.transactionHash;
        await sendTransactionDetailsToAPI({
          sender: address,
          symbol: selectedPaymentMethod,
          tokenAddress,
          amount: "0",
          amountToPay,
          inputAmountForeign,
          selectedCurrency,
          beneficiaryType,
          accountName,
          accountNumber,
          bankName,
          swiftOrBik,
          email,
          addressField,
          paymentPurpose,
          txHash,
          organizationName,
          inn,
          kpp,
          legalAddress,
          actualAddress,
          contactPerson,
          phone,
          documents,
        });

        router.push("/payments"); // Перенаправляем на /payments после успешной транзакции
      } catch (error) {
        console.error("Transaction failed:", error);
        alert("Произошла ошибка при выполнении транзакции. Пожалуйста, попробуйте снова.");
      }
      return;
    }

    // Логика для остальных типов платежей
    try {
      if (selectedPaymentMethod !== "INVOICE") {
        // Проверка баланса и введенной суммы
        if (BigNumber.from(amountInWei).gt(balance.value)) {
          alert("Указанная сумма больше доступного баланса!");
          return;
        }

        if (BigNumber.from(amountInWei).lte(0)) {
          alert("Введите корректную сумму!");
          return;
        }

        if (!paymentPurpose) {
          alert("Укажите назначение платежа!");
          return;
        }

        // Если не isSelf, проверяем банковские реквизиты
        if (!isSelf) {
          if (
            !accountName ||
            !accountNumber ||
            !bankName ||
            !swiftOrBik ||
            !email ||
            !addressField
          ) {
            alert("Заполните все поля банковских реквизитов!");
            return;
          }
        }

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

        const bankDetails = `Тип получателя: ${beneficiaryType}, Наименование счета: ${accountName}, Номер счета: ${accountNumber}, Банк: ${bankName}, ${
          selectedCurrency === "RUB" ? "БИК" : "SWIFT/BIC"
        }: ${swiftOrBik}, Email: ${email}, Адрес: ${addressField}`;
        const concatenatedDetails = `${bankDetails}, Назначение платежа: ${paymentPurpose}, ${additionalInfo}`;

        const encryptedDetails = CryptoJS.AES.encrypt(
          concatenatedDetails,
          "enkey"
        ).toString();

        // Инициация транзакции
        const tx = await withdrawTokens({
          args: [tokenAddress, BigNumber.from(amountInWei), encryptedDetails],
        });

        const txHash = tx.receipt.transactionHash;
        await sendTransactionDetailsToAPI({
          sender: address,
          symbol: selectedPaymentMethod,
          tokenAddress,
          amount: calculatedAmountToken,
          amountToPay,
          inputAmountForeign,
          selectedCurrency,
          beneficiaryType,
          accountName,
          accountNumber,
          bankName,
          swiftOrBik,
          email,
          addressField,
          paymentPurpose,
          txHash,
          organizationName,
          inn,
          kpp,
          legalAddress,
          actualAddress,
          contactPerson,
          phone,
          documents,
        });

        router.push("/payments"); // Перенаправляем на /payments после успешной транзакции
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Произошла ошибка при выполнении транзакции. Пожалуйста, попробуйте снова.");
    }
  };

  const handleCloseModal = () => {
    onOpenChange();
    router.push("/payments"); // Перенаправляем на /payments
  };

  const { user } = useUser();
  const [userId, setUserId] = useState("");
  const [isApproved, setUserIsApproved] = useState(false);

  useEffect(() => {
    const userDatawithData :any = user.data;
    if (userDatawithData) {
      setUserId(userDatawithData.userId);
      setUserIsApproved(userDatawithData.isApproved);
    }
  }, [user]);

  useEffect(() => {
    if (isSelf) {
      setSelectedCurrency("RUB");
      setSelectedPaymentMethod("RUR");
    }
  }, [isSelf]);

  useEffect(() => {
    if (isSelf && userId) {
      setPaymentPurpose(
        `Вывод средств на расчетный счет по договору оферты №1000${userId} от 17.06.2024`
      );
    }
  }, [isSelf, userId]);

  const canWithdraw = true;

  const [organizationName, setOrganizationName] = useState("");
  const [inn, setInn] = useState("");
  const [kpp, setKpp] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [actualAddress, setActualAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);

  // Функция для получения текста метки на английском для реквизитов получателя
  const getRecipientLabel = (labelEn: string) => {
    return labelEn;
  };

  return (
    <>
      <h2>Вывод средств</h2>
      {canWithdraw && (
        <div className="withdraw-container">
          {/* Скрываем выбор способа оплаты, если isSelf == true */}
          {!isSelf && (
            <div className="field-group">
              <label>Выберите способ оплаты:</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                {paymentMethods.map((method) => (
                  <option key={method.code} value={method.code}>
                    {method.name}
                    {method.code !== "INVOICE" &&
                      ` (${Number(
                        balances[method.code]?.displayValue || "0"
                      ).toFixed(2)})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Отображение баланса */}
          {selectedPaymentMethod !== "INVOICE" && (
            <div className="balance-info">
              <p>
                Ваш баланс:{" "}
                {Number(balance?.displayValue || "0").toFixed(6)}{" "}
                {selectedPaymentMethod}
              </p>
            </div>
          )}

          {/* Скрываем выбор валюты и банковские реквизиты, если isSelf == true */}
          {!isSelf && (
            <>
              {/* Выбор валюты */}
              <div className="field-group">
                <label>Выберите валюту платежа:</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Сумма платежа и расчет инвойса для INVOICE */}
              {selectedPaymentMethod === "INVOICE" && (
                <>
                  <div className="field-group">
                    <label>{`Сумма платежа (${inputCurrency}):`}</label>
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
                  <div className="field-group">
                    <label>
                      Предполагаемая сумма инвойса (руб.). <br />
                      <small>
                        Окончательная сумма будет рассчитана после подтверждения
                        платежным агентом.
                      </small>
                    </label>
                    <Input type="text" value={amountToPay} disabled />
                  </div>
                </>
              )}

              {/* Сумма вывода для других способов оплаты */}
              {selectedPaymentMethod !== "INVOICE" && (
                <>
                  <div className="field-group">
                    <label>{`Сумма вывода (${inputCurrency}):`}</label>
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
                    <label>{`Сумма в ${selectedPaymentMethod}:`}</label>
                    <Input type="text" value={calculatedAmountToken} disabled />
                  </div>
                </>
              )}
            </>
          )}

          {/* Сумма платежа, когда isSelf == true */}
          {isSelf && (
            <div className="field-group">
              <label>Сумма вывода (RUB):</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={inputAmountForeign}
                required
                placeholder="Введите сумму в RUB"
                onChange={(e) => setInputAmountForeign(e.target.value)}
              />
            </div>
          )}

          {/* Назначение платежа */}
          <div className="field-group">
            <label>Назначение платежа:</label>
            {isSelf ? (
              <p>{paymentPurpose}</p>
            ) : (
              <Input
                type="text"
                placeholder="Введите назначение платежа"
                value={paymentPurpose}
                onChange={(e) => setPaymentPurpose(e.target.value)}
                required
              />
            )}
          </div>

          {/* Скрываем банковские реквизиты, если isSelf == true */}
          {!isSelf && (
            <>
              {/* Загрузка документа */}
              <div className="field-group">
                <label>
                  Загрузите документ (инвойс и/или контракт):
                </label>
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
              <h3>Beneficiary bank details</h3>
              <div className="field-group">
                <label>{getRecipientLabel("Beneficiary type:")}</label>
                <select
                  value={beneficiaryType}
                  onChange={(e) => setBeneficiaryType(e.target.value)}
                >
                  <option value="Business">Company</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>
              <div className="field-group">
                <label>{getRecipientLabel("Account name:")}</label>
                <Input
                  type="text"
                  placeholder="Enter account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>{getRecipientLabel("Account number:")}</label>
                <Input
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>{getRecipientLabel("Bank name:")}</label>
                <Input
                  type="text"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>
                  {selectedCurrency === "RUB"
                    ? getRecipientLabel("BIC:")
                    : getRecipientLabel("SWIFT/BIC:")}
                </label>
                <Input
                  type="text"
                  placeholder={
                    selectedCurrency === "RUB"
                      ? "Enter BIC code"
                      : "Enter SWIFT/BIC code"
                  }
                  value={swiftOrBik}
                  onChange={(e) => setSwiftOrBik(e.target.value)}
                  required
                />
              </div>
              <div className="field-group">
                <label>Email:</label>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {/* Адрес */}
              <div className="field-group">
                <label>{getRecipientLabel("Address:")}</label>
                <Textarea
                  placeholder="Enter full address, including country, city, and postal code"
                  value={addressField}
                  onChange={(e) => setAddressField(e.target.value)}
                  required
                />
              </div>

              {/* Дополнительные поля */}
              {isSelf === false && isApproved === false && (
                <>
                  <hr />
                  <h3 className="text-large py-4">
                    <b>Дополнительная информация о плательщике:</b>
                  </h3>
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
                  <hr className="py-2" />
                </>
              )}
            </>
          )}

          {/* Кнопка отправки */}
          <Web3Button
            className="withdraw-button"
            contractAddress={tokenAddress}
            action={handleWithdraw}
            isDisabled={isApproving || isWithdrawing}
          >
            {isApproving || isWithdrawing
              ? `Идет подтверждение транзакции${dots}`
              : BigNumber.from(amountInWei).gte(0)
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
          <>
            <ModalHeader className="fixed-modeal-header">
              Запрос принят
            </ModalHeader>
            <ModalBody>
              <p>
                Ваш запрос успешно отправлен! Ожидайте подтверждения.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={handleCloseModal}>
                Закрыть
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
};

export default WithdrawBlock;

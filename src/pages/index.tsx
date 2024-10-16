// pages/index.tsx

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  useBalance,
  useContract,
  useContractMetadata,
  useUser,
} from "@thirdweb-dev/react";
import { observer } from "mobx-react-lite";
import contractStore from "@/stores/ContractStore";
import {
  contractAddresses,
  configMetadataUSDT,
  configMetadataUSDC,
  configMetadataRUBi,
} from "../../const/contracts";
import TokensTxBlock from "../components/TokensTxBlock";
import { motion, AnimatePresence } from "framer-motion";
import AgreementModal from "../components/AgreementModal"; // Импортируем новый компонент
import useIsMobile from "../hooks/useIsMobile"; // Импортируем хук

import styles from "../styles/Home.module.css";

const Home = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const { currency } = router.query;
  const [organizationName, setOrganizationName] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("RUR");
  const [userApproved, setUserApproved] = useState<boolean>(false);
  const [defaultAccount, setDefaultAccount] = useState<string>("USDT");
  const currentBalanceRef = useRef<HTMLDivElement>(null);
  const [sentRequest, setUserSentRequest] = useState(false);

  // Используем хук для определения, является ли устройство мобильным
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user && user.data) {
      const userData: any = user.data;
      if (
        userData.isApproved === false &&
        userData.organizationName &&
        userData.organizationName.length > 2
      ) {
        setUserSentRequest(true);
      }
    }
  }, [user]);

  // Состояние для модального окна
  const [showTosModal, setShowTosModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    const UserData: any = user;
    if (UserData?.data) {
      setOrganizationName(UserData.data?.organizationName);
      // Проверяем, принял ли пользователь договор оферты
      if (UserData.data.isTos === false) {
        setShowTosModal(true);
      }
    }
  }, [user]);

  useEffect(() => {
    const validCurrencies = ["RUR", "USDT", "USDC", "RUBi"];
    if (
      currency &&
      typeof currency === "string" &&
      validCurrencies.includes(currency)
    ) {
      setSelectedAccount(currency);
    } else {
      setSelectedAccount(defaultAccount);
    }
  }, [currency, defaultAccount]);

  const { data: balanceRUR } = useBalance(contractAddresses["RUR"]);
  const { data: balanceUSDT } = useBalance(contractAddresses["USDT"]);
  const { data: balanceUSDC } = useBalance(contractAddresses["USDC"]);
  const { data: balanceRUBi } = useBalance(contractAddresses["RUBi"]);

  const contractRUR = useContract(contractAddresses["RUR"]);
  const { data: metadataRUR } = useContractMetadata(contractRUR.contract);

  const contractUSDT = useContract(contractAddresses["USDT"]);
  const { data: metadataUSDT } = configMetadataUSDT;

  const contractUSDC = useContract(contractAddresses["USDC"]);
  const { data: metadataUSDC } = configMetadataUSDC;

  const contractRUBi = useContract(contractAddresses["RUBi"]);
  const { data: metadataRUBi } = configMetadataRUBi;

  const [fetchedContracts, setFetchedContracts] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({
    RUR: "Загрузка...",
    USDT: "Загрузка...",
    USDC: "Загрузка...",
    RUBi: "Загрузка...",
  });

  useEffect(() => {
    const fetchBalances = () => {
      setBalance({
        RUR: balanceRUR?.displayValue
          ? Number(balanceRUR.displayValue).toFixed(2)
          : "0.00",
        USDT: balanceUSDT?.displayValue
          ? Number(balanceUSDT.displayValue).toFixed(2)
          : "0.00",
        USDC: balanceUSDC?.displayValue
          ? Number(balanceUSDC.displayValue).toFixed(2)
          : "0.00",
        RUBi: balanceRUBi?.displayValue
          ? Number(balanceRUBi.displayValue).toFixed(2)
          : "0.00",
      });
    };

    fetchBalances();
    const intervalId = setInterval(fetchBalances, 2000);

    return () => clearInterval(intervalId);
  }, [balanceRUR, balanceUSDT, balanceUSDC, balanceRUBi]);

  useEffect(() => {
    const contracts = [];
    const UserData: any = user;
    let isUserApproved = false;
    if (UserData?.data) {
      isUserApproved = UserData?.data?.isApproved;
      setUserApproved(isUserApproved);
    }

    if (isUserApproved) {
      contracts.push({
        currency: "RUR",
        contract: contractRUR,
        metadata: metadataRUR,
      });
      setDefaultAccount("RUR");
      setSelectedAccount("RUR");
    } else {
      contracts.push({
        currency: "CREATE_RUR",
        contract: null,
        metadata: { name: "+ Создать рублевый счет (RUR)", symbol: "RUR" },
      });
    }

    contracts.push(
      { currency: "USDT", contract: contractUSDT, metadata: metadataUSDT },
      { currency: "USDC", contract: contractUSDC, metadata: metadataUSDC },
      { currency: "RUBi", contract: contractRUBi, metadata: metadataRUBi }
    );

    contractStore.setContracts(contracts);

    setFetchedContracts(contracts);
    console.log(contracts);
    console.log(user);
  }, [metadataRUR, user]);

  const handleAccountClick = (currency: string) => {
    if (currency === "CREATE_RUR") {
      router.push("/create_rur");
      return;
    }

    setSelectedAccount(currency);
    router.push(`/?currency=${currency}`, undefined, { shallow: true });
  };

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  // Определяем, нужно ли показывать выбор счета
  // На мобильных: скрываем, если currency указан
  // На десктопах: всегда показываем
  const showAccountSelection = !(isMobile && currency);

  // Функция обработки согласия с условиями
  const handleAcceptTos = async () => {
    try {
      const response = await fetch("/api/tos-agree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message); // 'Подтверждено'
        // Обновите состояние приложения, чтобы убрать модальное окно
      } else {
        const errorData = await response.json();
        console.error("Ошибка:", errorData.error);
      }
    } catch (error) {
      console.error("Ошибка при отправке запроса:", error);
    }

    setShowTosModal(false);
  };

  return (
    <>
      {/* Модальное окно с договором оферты */}
      {showTosModal && <AgreementModal onAccept={handleAcceptTos} />}

      {/* Кнопка "Вернуться к выбору счета", если currency указан и устройство мобильное */}
      {!showAccountSelection && isMobile && (
        <button
          className="back-button"
          onClick={() => {
            setSelectedAccount(defaultAccount); // Сбрасываем на счет по умолчанию
            router.push(`/`, undefined, { shallow: true });
          }}
        >
          ← Вернуться к выбору счета
        </button>
      )}

      {/* Компонент выбора счета */}
      {showAccountSelection && (
        <div className="accounts">
          <h2>Выбор счета:</h2>
          <div className="account-list">
            {fetchedContracts.map(({ currency, metadata }, index) => {
              if (currency === "CREATE_RUR") {
                // Отображаем кнопку "Создать рублевый счет" аккуратнее
                return (
                  <>
                    {!sentRequest ? (
                      <div
                        onClick={() => handleAccountClick(currency)}
                        key={index}
                        className="account new-account"
                      >
                        <i className="fas fa-plus-circle account-icon"></i>
                        <span>{metadata?.name}</span>
                      </div>
                    ) : (
                      <>
                        <div className={`account new-account`} key={index}>
                          <i className="fas fa-wallet account-icon"></i>
                          <span>Рубль (RUR)</span>
                          <span className="amount">Заявка обрабатывается</span>
                        </div>
                      </>
                    )}
                  </>
                
                );
              } else {
                // Отображаем остальные счета
                return (
                  <div
                    onClick={() => handleAccountClick(currency)}
                    key={index}
                    className={`account ${
                      selectedAccount === currency ? "account-selected" : ""
                    }`}
                  >
                    <i className="fas fa-wallet account-icon"></i>
                    <span>
                      {metadata?.name} ({metadata?.symbol})
                    </span>
                    <span className="amount">
                      {balance[currency]} {metadata?.symbol}
                    </span>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Блок баланса */}
        {selectedAccount && (
          <motion.div
            key={`balance-${selectedAccount}`}
            className="current-balance-section"
            ref={currentBalanceRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Счет {selectedAccount}:</h2>
            <div className="wallet-card">
              <div className="wallet-info">
                <div className="wallet-details">
                  <span className="company-name">Баланс</span>
                  <span className="balance">
                    {balance[selectedAccount]} {selectedAccount}
                  </span>
                </div>
                <div className="wallet-actions">
                  {/* Кнопка "Иностранный Платеж" доступна для всех валют */}
                  {true && (
                    <button
                      onClick={() =>
                        handleNavigation(`/withdraw/${selectedAccount}`)
                      }
                    >
                      Трансграничный Платеж
                    </button>
                  )}
                  {/* Остальные кнопки */}
                  {selectedAccount === "RUR" ? (
                    <>
                      <button
                        onClick={() =>
                          handleNavigation(
                            `/swap?inCurrency=RUR&outCurrency=USDT`
                          )
                        }
                      >
                        Обменять
                      </button>
                      <button onClick={() => handleNavigation(`/deposit/RUR`)}>
                        Пополнить
                      </button>
                      <button
                        onClick={() =>
                          handleNavigation(`/withdraw/RUR?self=true`)
                        }
                      >
                        Вывести
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleNavigation(`/transfer/${selectedAccount}`)
                        }
                      >
                        Отправить
                      </button>
                      <button
                        onClick={() =>
                          handleNavigation(`/deposit/${selectedAccount}`)
                        }
                      >
                        Принять
                      </button>

                      <button
                        onClick={() =>
                          handleNavigation(`/swap?inCurrency=${selectedAccount}`)
                        }
                      >
                        Обменять
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Блок транзакций */}
        {selectedAccount && selectedAccount !== "CREATE_RUR" && (
          <motion.div
            key={`transactions-${selectedAccount}`}
            className="transactions-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Транзакции по счету {selectedAccount}:</h2>
            <TokensTxBlock symbol={selectedAccount} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Стили */}
      <style jsx>{`
        /* Остальные стили */
        .accounts {
          transition: opacity 0.5s ease-in-out, max-height 0.5s ease-in-out;
          overflow: hidden;
        }
        
        .back-button {
          padding: 10px 0px;
          margin-bottom: 20px;
          border-radius: 5px;
          cursor: pointer;
          background-color: transparent;
          border: none;
          color: #1890ff;
          font-size: 1em;
          text-align: left;
        }
        .back-button:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .wallet-actions {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>
    </>
  );
});

export default Home;

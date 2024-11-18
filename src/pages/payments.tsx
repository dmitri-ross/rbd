// pages/payments.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@thirdweb-dev/react";
import { observer } from "mobx-react-lite";
import PaymentsBlock from "../components/PaymentsBlock";
import { BackButton } from "@/components/BackButton";
import Link from "next/link";
const Payments = observer(() => {
  const { user, isLoggedIn, isLoading } = useUser();
  const router = useRouter();
  const { currency } = router.query;
  const [selectedCurrency, setSelectedCurrency] = useState<string>("ALL");

  // Редирект на страницу входа, если пользователь не авторизован
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  // Установка выбранной валюты на основе параметров запроса
  useEffect(() => {
    const validCurrencies = ["RUR", "USDT", "USDC", "RUBi", "ALL"];
    if (
      currency &&
      typeof currency === "string" &&
      validCurrencies.includes(currency.toUpperCase())
    ) {
      setSelectedCurrency(currency.toUpperCase());
    } else {
      setSelectedCurrency("ALL");
    }
  }, [currency]);

  // Обработчик изменения фильтра по валюте
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedCurrency(selected);
    if (selected === "ALL") {
      router.push("/payments", undefined, { shallow: true });
    } else {
      router.push(`/payments?currency=${selected}`, undefined, { shallow: true });
    }
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  return (
    <>
      <div className="dashboard-header">
        <BackButton />
        <div className="header-with-button">
          <h1 className="dashboard-header">История платежей:</h1>
          <Link href="/withdraw/INVOICE" className="new-payment-button">
            Новый платеж
          </Link>
        </div>

        {/* Фильтр по валюте */}
        <div className="currency-select">
          <label htmlFor="currency-select">Фильтр по валюте:</label>
          <select
            id="currency-select"
            value={selectedCurrency}
            onChange={handleCurrencyChange}
          >
            <option value="ALL">Все</option>
            <option value="RUR">RUR</option>
            <option value="USDT">USDT</option>
            <option value="USDC">USDC</option>
            <option value="RUBi">RUBi</option>
          </select>
        </div>

        {/* Отображение блока платежей */}
        {selectedCurrency && (
          <PaymentsBlock symbol={selectedCurrency === "ALL" ? "" : selectedCurrency} />
        )}
      </div>

      <style jsx>{`
        .header-with-button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 20px;
        }
        .new-payment-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border-radius: 5px;
          text-decoration: none;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        .new-payment-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </>
  );
});

export default Payments;

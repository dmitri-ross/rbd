// components/PaymentsBlock.tsx

import { useEffect, useState } from "react";
import { useUser } from "@thirdweb-dev/react";
import axios from "axios";
import Link from "next/link";

interface PaymentResponse {
  id: number;
  amount: string;
  symbol: string | null;
  payment_purpose: string;
  computed_status: string;
  created_at: string | null;
  tx_hash: string | null;
  invoice_file: string | null;
  receipt_file: string | null;
  selected_currency: string | null;
  account_name: string | null;
  input_amount_foreign: string | null;
  document_ipfs_link: string | null;
  // Add other necessary fields
}

const PaymentsBlock = ({ symbol }: { symbol: string }) => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const params: any = {};
        if (symbol && symbol !== "") {
          params.currency = symbol;
        }
        const res = await axios.get(`/api/payments`, {
          params,
        });
        setPayments(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при получении платежей:", error);
        setLoading(false);
      }
    };

    // Remove the 'if (symbol)' condition to always fetch payments
    fetchPayments();
    const intervalId = setInterval(fetchPayments, 2000); // Refresh payments every 10 seconds

    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, [symbol]);

  const convertIpfsToHttp = (ipfsUrl: string) => {
    if (!ipfsUrl) return '';
    // Convert IPFS URL to use Cloudflare IPFS gateway
    return ipfsUrl.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/');
  };

  if (loading) return <p>Загрузка...</p>;
  if (payments.length === 0) return <p>Нет платежей.</p>;
  const userLocale = navigator.language || 'default';
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className="transactions-list">
      <div className="table-responsive">
        <table className="transactions-table">
          <thead>
            <tr>
              <th className="w-[13%]">Дата</th>
              
              <th className="w-[13%]">Оплачено</th>
              <th className="w-[13%]">Сумма платежа</th>
              <th className="w-[13%]">Получатель</th>
              <th className="w-[13%]">Назначение платежа</th>
              <th className="w-[13%]">Статус</th>
              <th className="w-[13%]">Действия</th>
            </tr>
           
          </thead>
          <tbody>
            {payments.map((payment) => {
              // Format the date
              const date = payment.created_at
                ? new Date(payment.created_at).toLocaleString(undefined, {
                  timeZone: "Europe/Moscow",
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })
                : "—";

              // Determine payment type
              const paymentType =
                payment.symbol === "INVOICE" ? "Счет" : "Платеж";

              // Actions (e.g., download invoice or receipt)
              const actions = [];

              if (payment.invoice_file) {
                actions.push(
                  <button
                    key="download-invoice"
                    className="download-button"
                    onClick={() => {
                      window.open(`/api/document?withdrawal_id=${payment.id}&doc=invoice`, "_blank");
                    }}
                  >
                    Счет
                  </button>
                );
              }

              if (payment.receipt_file) {
                actions.push(
                  <button
                    key="download-receipt"
                    className="download-button"
                    onClick={() => {
                      window.open(`/api/document?withdrawal_id=${payment.id}&doc=receipt`, "_blank");
                    }}
                  >
                    Квитанция
                  </button>
                );
              }

              if (payment.document_ipfs_link) {
                actions.push(
                  <button
                    key="view-document"
                    className="download-button"
                    onClick={() => {
                      window.open(`/api/document?withdrawal_id=${payment.id}&doc=ipfs`, "_blank");
                    }}
                  >
                    Инвойс
                  </button>
                );
              }

              // Link to transaction on blockchain explorer
              let txLink = null;
              if (payment.tx_hash) {
                // txLink = (
                //   <Link
                //     href={`https://polygonscan.com/tx/${payment.tx_hash}`}
                //     passHref
                //     target="_blank"
                //       rel="noopener noreferrer"
                //       className="tx-link"
                //                       >
                   
                //       Смотреть транзакцию
                   
                //   </Link>
                // );
              }

              return (
                <tr key={payment.id}>
                  <td>{date}</td>
                
                  <td className="amount-in">
                    {Number(payment.amount).toFixed(2)}{" "}
                    {payment.symbol}
                  </td>
                  <td className="amount-in">
                    {payment.input_amount_foreign 
                      ? `${Number(payment.input_amount_foreign).toFixed(2)} ${payment.selected_currency || ''}`
                      : '—'
                    }
                  </td>
                  <td>{payment.account_name || '—'}</td>
                  <td>{payment.payment_purpose}</td>
                  <td>{payment.computed_status}</td>
                  <td>
                    <div className="actions-container">
                      {actions.length > 0 && actions.map((action) => action)}
                      {txLink && txLink}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .download-button {
          margin: 2px;
          padding: 4px 8px;
          font-size: 0.9em;
        }
        .actions-container {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
      `}</style>
    </div>
  );
};

export default PaymentsBlock;

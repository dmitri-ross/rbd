// components/DepositBlock.tsx

import { useUser } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import QRCode from 'react-qr-code';

const DepositBlock = ({ symbol }) => {
  const { user } = useUser();
  const [userId, setUserId] = useState("");
  
  const [userAddress, setUserAddress] = useState("");
  const [isApproved, setUserIsApproved] = useState(false);
  useEffect(() => {
    const userDatawithData: any = user;
    if (userDatawithData && userDatawithData.data) {
    
      setUserAddress(userDatawithData.address);
      console.log(userAddress);
      setUserId(userDatawithData.data.userId);
      setUserIsApproved(userDatawithData.data.isApproved);
    }
    
  }, [user]);

  // Payment details for RUR
  const paymentDetails = {
    name: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ОПТИМУМСОФТ"',
    inn: "9703002368",
    bank: "ПАО Сбербанк",
    account: "40702810038000470531",
    bic: "044525225",
    purpose: `Оплата по договору оферты №1000${userId} от 17.06.2024`,
  };

  // Generate QR code data for RUR
  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    if (symbol?.toString() === "RUR" && isApproved) {
      // Формируем данные для QR-кода для RUR
      const qrData = `ST00012|Name=${paymentDetails.name}|PersonalAcc=${paymentDetails.account}|BankName=${paymentDetails.bank}|BIC=${paymentDetails.bic}|CorrespAcc=30101810400000000225|PayeeINN=${paymentDetails.inn}|Purpose=${paymentDetails.purpose}`;
      setQrCodeData(qrData);
    }
  }, [symbol, isApproved, paymentDetails]);

  return (
    <>
      <div className="deposit-container">
        <h2>Информация для пополнения счета</h2>

        {symbol?.toString() === "RUR" ? (
          <>
            {isApproved ? (
              <>
                <div className="deposit-details">
                  <p>
                    <strong>Наименование:</strong> {paymentDetails.name}
                  </p>
                  <p>
                    <strong>ИНН:</strong> {paymentDetails.inn}
                  </p>
                  <p>
                    <strong>Банк:</strong> {paymentDetails.bank}
                  </p>
                  <p>
                    <strong>Расчетный счет:</strong> {paymentDetails.account}
                  </p>
                  <p>
                    <strong>БИК:</strong> {paymentDetails.bic}
                  </p>
                  <p>
                    <strong>Назначение платежа:</strong> {paymentDetails.purpose}
                  </p>
                </div>

                {/* QR Code for RUR */}
                {qrCodeData && (
                  <div className="qr-code">
                    <p>
                      Вы можете отсканировать QR-код для автоматического заполнения
                      платежных реквизитов:
                    </p>
                    <QRCode value={qrCodeData} size={200} level="H" />
                  </div>
                )}

                <p>
                  После совершения платежа средства будут зачислены на ваш счет в
                  течение 1-2 рабочих дней.
                </p>
              </>
            ) : (
              <div className="alert-message">
                <h4 className="danger">
                  Платформа работает в тестовом режиме. Для получения возможности
                  пополнения счета обратитесь к администратору
                  admin@stableunion.org.
                </h4>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="deposit-details">
              <p>
                <strong>Сеть:</strong> Polygon (MATIC)
              </p>
              <p>
                <strong>Ваш адрес для пополнения:</strong> {userAddress}
              </p>
            </div>

            {/* QR Code for non-RUR currencies */}
            {userAddress && (
              <div className="qr-code">
                <p>
                  Вы можете отсканировать QR-код для автоматического заполнения
                  адреса кошелька:
                </p>
                 <QRCode value={userAddress} size={200} level="H" />
              </div>
            )}

            <p>
              Пожалуйста, отправьте {symbol} на указанный адрес через сеть Polygon.
            </p>
            <p>
              **Внимание:** Отправляйте только {symbol} через сеть Polygon (MATIC).
              Отправка других токенов или через другие сети может привести к потере
              средств.
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default DepositBlock;

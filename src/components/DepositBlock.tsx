// components/DepositBlock.tsx

import { useUser } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import QRCode from 'react-qr-code';
import iconv from 'iconv-lite';

const DepositBlock = ({ symbol }) => {
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

  // Payment details
  const paymentDetails = {
    name: 'ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ "ОПТИМУМСОФТ"',
    inn: "9703002368",
    bank: "ПАО Сбербанк",
    account: "40702810038000470531",
    bic: "044525225",
    purpose: `Оплата по договору оферты №1000${userId} от 17.06.2024`,
  };

  // Generate QR code data
  const [qrCodeData, setQrCodeData] = useState("");

  useEffect(() => {
    if (symbol?.toString() === "RUB" && isApproved) {
      // Create a string with payment details in a format recognized by Russian banks
      // Using SBP (System of Fast Payments) QR code format is complex and requires registration
      // We'll use a simple format that includes essential payment details
      const qrData = `ST00012|Name=${paymentDetails.name}|PersonalAcc=${paymentDetails.account}|BankName=${paymentDetails.bank}|BIC=${paymentDetails.bic}|CorrespAcc=30101810400000000225|PayeeINN=${paymentDetails.inn}|Purpose=${paymentDetails.purpose}`;
      

      // const encoderUTF8 = new TextEncoder();
      // const arrayUTF8 = encoderUTF8.encode(qrData);
      // let encToCP1251 = new TextDecoder('cp1251');
      // const strCP1251 = encToCP1251.decode(arrayUTF8);
      // console.log(strCP1251);
      setQrCodeData(qrData);
      

     
    }
  }, [symbol, isApproved, paymentDetails]);

  return (
    <>
      <div className="deposit-container">
        <h2>Информация для депозита</h2>

        {symbol?.toString() === "RUB" ? (
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

                {/* QR Code */}
                {qrCodeData && (
                  <div className="qr-code">
                    <p>Вы можете отсканировать QR-код для автоматического заполнения платежных реквизитов:</p>
                    <QRCode value={qrCodeData} size={200} level="H" />
                  </div>
                )}

                <p>
                  После совершения платежа средства будут зачислены на ваш счет в течение 1-2 рабочих дней.
                </p>
              </>
            ) : (
              <div className="alert-message">
                <h4 className="danger">
                  Платформа работает в тестовом режиме. Для получения возможности пополнения счета обратитесь к администратору admin@stableunion.org.
                </h4>
              </div>
            )}
          </>
        ) : (
          <div className="alert-message">
            <h3 className="danger">Временно недоступно!</h3>
            <h4 className="danger">Выберите другую валюту.</h4>
          </div>
        )}
      </div>
    </>
  );
};

export default DepositBlock;

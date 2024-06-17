import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@nextui-org/react";
import { useUser } from "@thirdweb-dev/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export const DepositBlock = (symbol) => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const userDatawithData: any = user;
    setUserId(userDatawithData.data.userId);
  }, [user]);
  return (
    <>
      <Card className="dark mg-top-20 w-320">
        <CardHeader className="flex gap-3">{t("depositFunds")}</CardHeader>
        <Divider />
        <CardBody>
          <p>{t("depositInstructions")}</p>
        </CardBody>
        <Divider />

        <CardBody>
          {symbol.symbol === "RUB" && (
            <>
              <p>{t("bankDetailsRUB")}</p>
              <p>
                {t("bank")}: <i> ПАО Сбербанк</i>
              </p>
              <p>
                {t("account")}: <i>40702810038000470531</i>
              </p>
              <p>
                {t("bic")}: <i>044525225</i>
              </p>
              <p>
                {t("paymentPurpose")}:{" "}
                <i>Оплата по договору оферты №1000{userId} от 17.06.2024</i>
              </p>
            </>
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

          {/* {symbol.symbol === 'INR' && <>
            <p>{t('bankDetailsINR')}</p>
            <p>{t('bank')}: State Bank of India</p>
            <p>{t('account')}: 31107460283</p>
            <p>{t('ifsc')}: SBIN0001707</p>
            <p>{t('paymentPurpose')}: <i>{user?.address}</i></p>
          </>}

          {symbol.symbol === 'USD' && <>
            <p>{t('bankDetailsUSD')}</p>
            <p>{t('bank')}: Bank of America</p>
            <p>{t('account')}: 4426324623</p>
            <p>{t('routingNumber')}: 026009593</p>
            <p>{t('paymentPurpose')}: <i>{user?.address}</i></p>
          </>} */}
        </CardBody>
        <Divider />

        <CardFooter>
          <p>{t("depositCompletion")}</p>
        </CardFooter>
      </Card>
    </>
  );
};

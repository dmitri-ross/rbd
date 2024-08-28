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
  const [isApproved, setUserIsApproved] = useState(false);

  useEffect(() => {
    const userDatawithData:any = user;
    if (userDatawithData && userDatawithData.data) {
      setUserId(userDatawithData.data.userId);
      setUserIsApproved(userDatawithData.data.isApproved);
      console.log(symbol, isApproved);
    }
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
          {symbol?.symbol === "RUB" ? ( // Check if symbol is defined
            <>
              {isApproved ? (
                <>
                  <p>{t("bankDetailsRUB")}</p>
                  <p>
                    Наименование:{" "}
                    <i>
                      ОБЩЕСТВО С ОГРАНИЧЕННОЙ ОТВЕТСТВЕННОСТЬЮ
                      &quot;ОПТИМУМСОФТ&quot;
                    </i>
                  </p>
                  <p>
                    ИНН: <i>9703002368</i>
                  </p>
                  <p>
                    {t("bank")}: <i>ПАО Сбербанк</i>
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
              ) : (
                <div>
                  
                  <h4 className="danger">Платформа работает в тестовом режиме. Для получения возможности пополнения счета обратитесь к администратору admin@stableunion.org.</h4>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col gap-4">
              <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
                <div>
                  <h3 className="danger">Временно недоступно!</h3>
                  <h4 className="danger">Выберите другую валюту.</h4>
                </div>
              </div>
            </div>
          )}
        </CardBody>
        <Divider />

        <CardFooter>
          <p>{t("depositCompletion")}</p>
        </CardFooter>
      </Card>
    </>
  );
};

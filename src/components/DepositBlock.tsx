import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider
} from "@nextui-org/react";
import {
  useUser
} from "@thirdweb-dev/react";
export const DepositBlock = (symbol) => {
  
  const { user } = useUser();
  return (
    <>
      <Card className="dark mg-top-20 w-320" >
        <CardHeader className="flex gap-3">Депозит средств</CardHeader>
        <Divider />
        <CardBody>
          <p>
            Для депозита средств, пожалуйста, выполните банковский перевод на
            следующие банковские реквизиты.
          </p>
        </CardBody>
        <Divider />

        <CardBody>
          {symbol.symbol == 'RUB' && <>
            <p>Банковские реквизиты для перевода в рублях:</p>
            <p>Банк: <i>Сбербанк России</i></p>
            <p>Счет: <i>40702810438250000023</i></p>
            <p>БИК: <i>044525225</i></p>
            <p>Назначение платежа: <i>Зачисление на счет цифровой валюты {user?.address}</i></p>
            </> }

            {symbol.symbol == 'INR' && <>
            <p>Банковские реквизиты для перевода в рупиях:</p>
            <p>Банк: State Bank of India</p>
            <p>Счет: 31107460283</p>
            <p>IFSC Code: SBIN0001707</p>
            <p>Назначение платежа: <i>{user?.address}</i></p>
            </> }

            {symbol.symbol == 'USD' && <>
            <p>Банковские реквизиты для перевода в долларах:</p>
            <p>Банк: Bank of America</p>
            <p>Счет: 4426324623</p>
            <p>Routing Number: 026009593</p>
            <p>Назначение платежа: <i>{user?.address}</i></p>
            </> }

        </CardBody>
        <Divider />

        
        <Divider />
        <CardFooter>
          <p>Зачисление происходит в течение 24 часов.</p>
        </CardFooter>
      </Card>
    </>
  );
};

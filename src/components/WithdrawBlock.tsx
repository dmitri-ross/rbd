import { Input } from "@nextui-org/react";
import { useUser } from "@thirdweb-dev/react";
export const WithdrawBlock = (symbol) => {
  const { user } = useUser();
  return (
    <>
      {symbol.symbol == "RUB" && (
        <div className="w-full flex flex-col gap-4">
          <div className=" dark flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
            <Input
              className="mg-top-20 "
              type="bankName"
              label="Наименование банка:"
              placeholder="Введите наименование банк"
            />
            <Input type="bik" label="БИК:" placeholder="Введите БИК" required />
            <Input
              type="accountNumber"
              label="Расчетный счет (р/с):"
              placeholder="Введите номер счета"
              required
            />
            <Input
              type="amount"
              label="Сумма вывода:"
              min="1"
              required
              placeholder="Укажите сумму"
            />
          </div>
        </div>
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
    </>
  );
};

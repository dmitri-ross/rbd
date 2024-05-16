import styles from "../styles/Home.module.css";
import { Button, ButtonGroup } from "@nextui-org/button";
import { useRouter } from "next/router";
import { useTranslation } from 'react-i18next';
export const TopMenu = ({ symbol = "" }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const handleNavigation = (url) => {
    router.push(url);
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 items-center ">
        <Button
          className="dark mg-top-20 w-150 navbutton"
          onPress={() =>
            handleNavigation(`/transfer${symbol != "" ? "/" + symbol : ""}`)
          }
          color="default"
          variant="ghost"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.rotate45deg}
          >
            <path
              d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
          {t('send')}
        </Button>

        <Button
          isDisabled
          className="dark mg-top-20 w-150 navbutton "
          onPress={() => handleNavigation("/exchange")}
          color="default"
          variant="ghost"
        >
          <svg
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
          {t('swap')}
        </Button>

        <Button
          className="dark  w-150 navbutton  mg-20"
          onPress={() =>
            handleNavigation(`/deposit${symbol != "" ? "/" + symbol : ""}`)
          }
          color="default"
          variant="ghost"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
          {t('deposit')}
        </Button>

        <Button
          className="dark w-150 navbutton mg-20"
          onPress={() =>
            handleNavigation(`/withdraw${symbol != "" ? "/" + symbol : ""}`)
          }
          color="default"
          variant="ghost"
        >
          <svg
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
            />
          </svg>
          {t('withdraw')}
        </Button>
      </div>
      {/* <ButtonGroup
          className="mg-20 mg-top-20"
          variant="shadow"
          fullWidth={true}
        >
          <Button
            onPress={() => handleNavigation("/transfer")}
            color="secondary"
          >
            Перевести
          </Button>
          <Button
            onPress={() => handleNavigation("/deposit")}
            color="secondary"
          >
            Купить
          </Button>
          <Button
            onPress={() => handleNavigation("/withdraw")}
            color="secondary"
          >
            Вывести
          </Button>
          <Button isDisabled color="secondary">
            Обмен
          </Button>
        </ButtonGroup> */}
    </>
  );
};

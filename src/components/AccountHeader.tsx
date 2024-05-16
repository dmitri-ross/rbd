import styles from "../styles/Home.module.css";
import { useTranslation } from 'react-i18next';

export const AccountHeader = () => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className={styles.heading}>{t('walletTitle')}</h2>
      <p className={styles.explain}>
        {t('walletDescription')}
      </p>
    </>
  );
};

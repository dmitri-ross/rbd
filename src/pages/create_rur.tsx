// pages/create_rur.tsx

import { useState, useEffect } from "react";
import CreateRurForm from "@/components/CreateRurForm";
import styles from "@/styles/Profile.module.css";
import { useUser } from "@thirdweb-dev/react";

const CreateRur = () => {
  const { user } = useUser();
  const [sentRequest, setUserSentRequest] = useState(false);

  // Handler after successful form submission
  const handleFormSubmit = (data) => {
    setUserSentRequest(true);
    // Здесь вы можете выполнить дополнительные действия, например, перенаправить пользователя или показать сообщение об успешной отправке
  };

  useEffect(() => {
    if (user && user.data) {
      const userData:any = user.data;
      if (
        userData.isApproved === false &&
        userData.organizationName &&
        userData.organizationName.length > 2
      ) {
        setUserSentRequest(true);
      }
    }
  }, [user]);

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Заявка на открытие счета</h1>
      {!sentRequest ? (
        <CreateRurForm onSubmit={handleFormSubmit} />
      ) : (
        <div className={styles.successMessage}>
          <p>Ваша заявка на открытие рублевого счета успешно отправлена!</p>
          <p>
            Наш менеджер свяжется с вами в ближайшее время. Как только мы
            проверим документы, счет будет открыт. Вы будете уведомлены по
            электронной почте.
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateRur;

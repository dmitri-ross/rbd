// components/CreateRurForm.tsx

import { useState, useEffect } from "react";
import styles from "@/styles/Profile.module.css";
import { Button, Input, Textarea } from "@nextui-org/react";
import axios from "axios";
import { useUser } from "@thirdweb-dev/react";

const CreateRurForm = ({ onSubmit }) => {
  const { user } = useUser();

  const [organizationName, setOrganizationName] = useState("");
  const [inn, setInn] = useState("");
  const [domicile, setDomicile] = useState("");
  const [legalRepresentativeName, setLegalRepresentativeName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deedOfEstablishment, setDeedOfEstablishment] = useState<File | null>(
    null
  );
  const [articlesOfAssociation, setArticlesOfAssociation] =
    useState<File | null>(null);
  const [proofOfCapacity, setProofOfCapacity] = useState<File | null>(null);
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreePersonalData, setAgreePersonalData] = useState(false);
  const [confirmRepresentative, setConfirmRepresentative] = useState(false);

  // Валидация полей формы
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!organizationName)
      newErrors.organizationName = "Введите название организации.";
    if (!inn) newErrors.inn = "Введите ИНН.";
    if (!domicile) newErrors.domicile = "Введите юридический адрес.";
    if (!legalRepresentativeName)
      newErrors.legalRepresentativeName =
        "Введите имя законного представителя.";
    if (!contactEmail) {
      newErrors.contactEmail = "Введите контактный email.";
    } else if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      newErrors.contactEmail = "Введите корректный email.";
    }
    if (!contactPhone) {
      newErrors.contactPhone = "Введите контактный телефон.";
    } else if (!/^\+?\d{10,15}$/.test(contactPhone)) {
      newErrors.contactPhone = "Введите корректный телефонный номер.";
    }

    // Проверяем загрузку документов
    if (!deedOfEstablishment)
      newErrors.deedOfEstablishment = "Загрузите учредительный документ.";
    if (!articlesOfAssociation)
      newErrors.articlesOfAssociation = "Загрузите устав.";
    if (!proofOfCapacity)
      newErrors.proofOfCapacity = "Загрузите подтверждение полномочий.";
    if (!identityDocument)
      newErrors.identityDocument =
        "Загрузите документ, удостоверяющий личность.";

    // Проверяем согласие с обработкой персональных данных
    if (!agreePersonalData)
      newErrors.agreePersonalData = "Вы должны дать согласие на обработку персональных данных.";

    // Проверяем подтверждение законного представительства
    if (!confirmRepresentative)
      newErrors.confirmRepresentative =
        "Вы должны подтвердить, что являетесь законным представителем.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);

    try {
      // Создаем объект FormData для отправки файлов
      const formData = new FormData();
      formData.append("organizationName", organizationName);
      formData.append("inn", inn);
      formData.append("domicile", domicile);
      formData.append("legalRepresentativeName", legalRepresentativeName);
      formData.append("contactEmail", contactEmail);
      formData.append("contactPhone", contactPhone);

      // Добавляем документы в FormData
      if (deedOfEstablishment) {
        formData.append("deedOfEstablishment", deedOfEstablishment);
      }

      if (articlesOfAssociation) {
        formData.append("articlesOfAssociation", articlesOfAssociation);
      }

      if (proofOfCapacity) {
        formData.append("proofOfCapacity", proofOfCapacity);
      }

      if (identityDocument) {
        formData.append("identityDocument", identityDocument);
      }

      // Отправляем данные на бэкенд
      const response = await axios.post("/api/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Обработка успешного ответа
      onSubmit(response.data);
    } catch (error) {
      console.error("Ошибка при отправке заявки:", error);
      // Здесь вы можете установить сообщения об ошибках для отображения пользователю
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className={styles.profileForm} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="organizationName">Название организации:</label>
        <Input
          id="organizationName"
          fullWidth
          size="lg"
          placeholder="Введите название организации"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
        />
        {errors.organizationName && (
          <p className={styles.error}>{errors.organizationName}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="inn">ИНН:</label>
        <Input
          id="inn"
          fullWidth
          size="lg"
          placeholder="Введите ИНН"
          value={inn}
          onChange={(e) => setInn(e.target.value)}
        />
        {errors.inn && <p className={styles.error}>{errors.inn}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="domicile">Юридический адрес:</label>
        <Textarea
          id="domicile"
          fullWidth
          size="lg"
          placeholder="Введите юридический адрес"
          value={domicile}
          onChange={(e) => setDomicile(e.target.value)}
        />
        {errors.domicile && <p className={styles.error}>{errors.domicile}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="legalRepresentativeName">
          Имя законного представителя:
        </label>
        <Input
          id="legalRepresentativeName"
          fullWidth
          size="lg"
          placeholder="Введите имя законного представителя"
          value={legalRepresentativeName}
          onChange={(e) => setLegalRepresentativeName(e.target.value)}
        />
        {errors.legalRepresentativeName && (
          <p className={styles.error}>{errors.legalRepresentativeName}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="contactEmail">Контактный Email:</label>
        <Input
          id="contactEmail"
          fullWidth
          size="lg"
          type="email"
          placeholder="example@domain.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
        {errors.contactEmail && (
          <p className={styles.error}>{errors.contactEmail}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="contactPhone">Контактный телефон:</label>
        <Input
          id="contactPhone"
          fullWidth
          size="lg"
          type="tel"
          placeholder="+7 (495) 123-45-67"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />
        {errors.contactPhone && (
          <p className={styles.error}>{errors.contactPhone}</p>
        )}
      </div>

      {/* Документы */}
      <div className={styles.formGroup}>
        <label htmlFor="deedOfEstablishment">Учредительный документ:</label>
        <input
          id="deedOfEstablishment"
          type="file"
          accept=".pdf, .jpg, .jpeg, .png"
          onChange={(e) =>
            setDeedOfEstablishment(e.target.files ? e.target.files[0] : null)
          }
          className={styles.fileInput}
        />
        {errors.deedOfEstablishment && (
          <p className={styles.error}>{errors.deedOfEstablishment}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="articlesOfAssociation">Устав:</label>
        <input
          id="articlesOfAssociation"
          type="file"
          accept=".pdf, .jpg, .jpeg, .png"
          onChange={(e) =>
            setArticlesOfAssociation(e.target.files ? e.target.files[0] : null)
          }
          className={styles.fileInput}
        />
        {errors.articlesOfAssociation && (
          <p className={styles.error}>{errors.articlesOfAssociation}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="proofOfCapacity">Подтверждение полномочий:</label>
        <input
          id="proofOfCapacity"
          type="file"
          accept=".pdf, .jpg, .jpeg, .png"
          onChange={(e) =>
            setProofOfCapacity(e.target.files ? e.target.files[0] : null)
          }
          className={styles.fileInput}
        />
        {errors.proofOfCapacity && (
          <p className={styles.error}>{errors.proofOfCapacity}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="identityDocument">
          Документ, удостоверяющий личность:
        </label>
        <input
          id="identityDocument"
          type="file"
          accept=".pdf, .jpg, .jpeg, .png"
          onChange={(e) =>
            setIdentityDocument(e.target.files ? e.target.files[0] : null)
          }
          className={styles.fileInput}
        />
        {errors.identityDocument && (
          <p className={styles.error}>{errors.identityDocument}</p>
        )}
      </div>

      {/* Чекбокс согласия с обработкой персональных данных */}
      <div className={styles.formGroupCheckbox}>
        <input
          type="checkbox"
          id="agreePersonalData"
          checked={agreePersonalData}
          onChange={(e) => setAgreePersonalData(e.target.checked)}
        />
        <label htmlFor="agreePersonalData">
          Я согласен на обработку персональных данных
        </label>
        {errors.agreePersonalData && (
          <p className={styles.error}>{errors.agreePersonalData}</p>
        )}
      </div>

      {/* Чекбокс подтверждения законного представительства */}
      <div className={styles.formGroupCheckbox}>
        <input
          type="checkbox"
          id="confirmRepresentative"
          checked={confirmRepresentative}
          onChange={(e) => setConfirmRepresentative(e.target.checked)}
        />
        <label htmlFor="confirmRepresentative">
          Я подтверждаю, что являюсь законным представителем юридического или физического лица
        </label>
        {errors.confirmRepresentative && (
          <p className={styles.error}>{errors.confirmRepresentative}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={uploading}
        className={styles.submitButton}
      >
        {uploading ? "Отправка..." : "Подать заявку"}
      </Button>
    </form>
  );
};

export default CreateRurForm;

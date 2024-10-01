// pages/api/profile.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { getUser } from '../../../auth.config';
import { updateUser } from '@/util/user';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true, maxFileSize: 10 * 1024 * 1024 }); // 10 MB ограничение
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

// Функция для извлечения значения поля как строки
const getFieldValue = (field: string | string[]): string => {
  if (Array.isArray(field)) {
    return field[0];
  } else {
    return field;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: `Метод '${req.method}' не разрешен` });
    return;
  }

  try {
    // Аутентификация пользователя
    const user = await getUser(req);
    if (!user || !user.address) {
      return res.status(401).json({ error: 'Неавторизованный доступ.' });
    }

    // Парсинг формы
    const { fields, files } = await parseForm(req);

    // Извлечение полей формы
    const organizationName = getFieldValue(fields.organizationName);
    const domicile = getFieldValue(fields.domicile);
    const legalRepresentativeName = getFieldValue(fields.legalRepresentativeName);
    const contactEmail = getFieldValue(fields.contactEmail);
    const contactPhone = getFieldValue(fields.contactPhone);
    const inn = getFieldValue(fields.inn); // Если у вас есть поле ИНН

    // Проверка обязательных полей
    if (
      !organizationName ||
      !domicile ||
      !legalRepresentativeName ||
      !contactEmail ||
      !contactPhone
    ) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
    }

    // Извлечение загруженных файлов
    const {
      deedOfEstablishment,
      articlesOfAssociation,
      proofOfCapacity,
      identityDocument,
    } = files as {
      [fieldname: string]: formidable.File | formidable.File[];
    };

    // Проверка наличия всех требуемых документов
    if (
      !deedOfEstablishment ||
      !articlesOfAssociation ||
      !proofOfCapacity ||
      !identityDocument
    ) {
      return res.status(400).json({ error: 'Необходимо загрузить все требуемые документы.' });
    }

    const sdk = ThirdwebSDK.fromPrivateKey(
      process.env.THIRDWEB_AUTH_PRIVATE_KEY as string,
      'polygon',
      { secretKey: process.env.TW_SECRET_KEY }
    );

    // Функция для загрузки файла в IPFS через Thirdweb
    const uploadToIPFS = async (file: formidable.File) => {
      const fileData = await fs.promises.readFile(file.filepath);
      const uploadResult = await sdk.storage.upload({
        data: fileData,
        name: file.originalFilename || file.newFilename,
      });
      return uploadResult;
    };

    // Загрузка каждого документа в IPFS
    const deedOfEstablishmentIpfs = await uploadToIPFS(
      Array.isArray(deedOfEstablishment) ? deedOfEstablishment[0] : deedOfEstablishment
    );
    const articlesOfAssociationIpfs = await uploadToIPFS(
      Array.isArray(articlesOfAssociation) ? articlesOfAssociation[0] : articlesOfAssociation
    );
    const proofOfCapacityIpfs = await uploadToIPFS(
      Array.isArray(proofOfCapacity) ? proofOfCapacity[0] : proofOfCapacity
    );
    const identityDocumentIpfs = await uploadToIPFS(
      Array.isArray(identityDocument) ? identityDocument[0] : identityDocument
    );

    // Подготовка данных профиля для обновления
    const profileData = {
      organizationName,
      domicile,
      legalRepresentativeName,
      contactEmail,
      contactPhone,
      deedOfEstablishmentIpfs,
      articlesOfAssociationIpfs,
      proofOfCapacityIpfs,
      identityDocumentIpfs,
      inn, // Добавьте ИНН, если требуется
    };

    // Обновление пользователя в базе данных
    const updatedUser = await updateUser(user.address, profileData);

    // Ответ об успешном обновлении
    res.status(200).json({
      message: 'Профиль успешно обновлен!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
}

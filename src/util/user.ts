// src/util/user.ts

import { query } from './db';

/**
 * Creates a new user if they don't exist.
 * @param address - The wallet address of the user.
 * @returns The created or existing user.
 */
export const createUser = async (address: string) => {
  const text = `
    INSERT INTO users (wallet_address)
    VALUES ($1)
    ON CONFLICT (wallet_address) DO NOTHING
    RETURNING *;
  `;
  const values = [address];
  try {
    const res = await query(text, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

/**
 * Finds a user by their wallet address.
 * @param address - The wallet address to search for.
 * @returns The user if found, else null.
 */
export const findUser = async (address: string) => {
  const text = 'SELECT * FROM users WHERE LOWER(wallet_address) = LOWER($1);';
  const values = [address];

  try {
    const res = await query(text, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error finding user:', err);
    throw err;
  }
};

/**
 * Updates a user's profile information.
 * @param address - The wallet address of the user.
 * @param profileData - An object containing the profile fields to update.
 * @returns The updated user.
 */
export const updateUser = async (
  address: string,
  profileData: {
    organizationName?: string;
    domicile?: string;
    deedOfEstablishmentIpfs?: string;
    articlesOfAssociationIpfs?: string;
    legalRepresentativeName?: string;
    proofOfCapacityIpfs?: string;
    identityDocumentIpfs?: string;
    contactEmail?: string;
    contactPhone?: string;
  }
) => {
  // Map the profileData keys to database column names
  const dbProfileData: { [key: string]: string } = {};

  if (profileData.organizationName) dbProfileData.organization_name = profileData.organizationName;
  if (profileData.domicile) dbProfileData.domicile = profileData.domicile;
  if (profileData.deedOfEstablishmentIpfs) dbProfileData.deed_of_establishment_ipfs = profileData.deedOfEstablishmentIpfs;
  if (profileData.articlesOfAssociationIpfs) dbProfileData.articles_of_association_ipfs = profileData.articlesOfAssociationIpfs;
  if (profileData.legalRepresentativeName) dbProfileData.legal_representative_name = profileData.legalRepresentativeName;
  if (profileData.proofOfCapacityIpfs) dbProfileData.proof_of_capacity_ipfs = profileData.proofOfCapacityIpfs;
  if (profileData.identityDocumentIpfs) dbProfileData.identity_document_ipfs = profileData.identityDocumentIpfs;
  if (profileData.contactEmail) dbProfileData.contact_email = profileData.contactEmail;
  if (profileData.contactPhone) dbProfileData.contact_phone = profileData.contactPhone;

  // Dynamically build the SET clause based on provided fields
  const setClauses = [];
  const values: any[] = [];
  let index = 1;

  for (const key in dbProfileData) {
    setClauses.push(`${key} = $${index}`);
    values.push(dbProfileData[key]);
    index++;
  }

  if (setClauses.length === 0) {
    throw new Error('No valid fields provided for update.');
  }

  const text = `
    UPDATE users
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE LOWER(wallet_address) = LOWER($${index})
    RETURNING *;
  `;
  values.push(address);

  try {
    const res = await query(text, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};

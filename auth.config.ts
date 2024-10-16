import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";
import { domainName } from "./const/contracts";
import { createUser, findUser } from "./src/util/user";

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  domain: domainName,
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
  callbacks: {
    onLogin: async (address, req) => {
      console.log(req)

      await createUser(address);
    },
    onToken: (token) => {
      console.log("onToken:");
      console.log(token);
    },
    onLogout: (user) => {
      console.log("onLogout:");
      console.log(user);
    },
    onUser: async (userSession) => {
      const user: any = await findUser(userSession.address);



      if (user && user.id) {
        console.log(user);
        return {
          ...userSession,
          userId: user.id || 0,
          isApproved: user.is_approved || false,
          businessName: user.business_name,
          organizationName: user.organization_name,
          inn: user.inn,
          domicile: user.domicile,
          deedOfEstablishmentIpfs: user.deed_of_establishment_ipfs,
          articlesOfAssociationIpfs: user.articles_of_association_ipfs,
          legalRepresentativeName: user.legal_representative_name,
          proofOfCapacityIpfs: user.proof_of_capacity_ipfs,
          identityDocumentIpfs: user.identity_document_ipfs,
          contactEmail: user.contact_email,
          contactPhone: user.contact_phone,
          isTos: user.is_tos,
        };
      }
      return {
        address: userSession.address,
      };
    },
  },
});

export default ThirdwebAuthHandler();
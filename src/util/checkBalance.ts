import { detectFeatures } from "@thirdweb-dev/sdk";
import {
  contractAddress,
} from "const/yourDetails";
export default async function checkKYCNft(sdk, address) {
  const contract = await sdk.getContract(
    contractAddress // replace this with your contract address
  );

  let balance = await contract.erc20.balanceOf(address);
  
  // gte = greater than or equal to
  return true;
}

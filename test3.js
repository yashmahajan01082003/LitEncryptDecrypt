import { LitNodeClient } from "@lit-protocol/lit-node-client";
// import {
//   createSiweMessage,
//   generateAuthSig,
//   LitAbility,
//   LitAccessControlConditionResource,
// } from "@lit-protocol/auth-helpers";
// import { AccessControlConditions } from "@lit-protocol/types";

import { getEnv, getEthersSigner, getLitNodeClient } from "./utils.js";

const ETHEREUM_PRIVATE_KEY = "4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc";

export const runExample = async () => {
  let litNodeClient;

  try {
    const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
    litNodeClient = await getLitNodeClient();

    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: await ethersSigner.getAddress(),
        },
      },
    ];

    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(
        "Eth India 2024"
      ),
      accessControlConditions,
    });

    return { ciphertext, dataToEncryptHash, accessControlConditions };
    console.log(`ℹ️  ciphertext: ${ciphertext}`);
    console.log(`ℹ️  dataToEncryptHashh: ${dataToEncryptHash}`);

  } catch (error) {
    console.error(error);
  }
}
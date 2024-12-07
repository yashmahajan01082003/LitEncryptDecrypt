// import { expect } from "chai";
import { LIT_ABILITY } from "@lit-protocol/constants";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { getEnv, getEthersSigner, getLitNodeClient } from "./utils.js";
import crypto from 'crypto';
global.crypto = crypto; // Make crypto globally available

import {
    createSiweMessage,
    generateAuthSig,
    LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
// import { encryptString, decryptToString } from "lit-protocol/encryption";
// import {decryptToString} from "@lit-protocol/encryption";
import { runExample } from "./test3.js";
import { ethers } from "ethers";

// Replace '<your private key>' with your actual Ethereum private key
const ethersWallet = new ethers.Wallet('4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc');

// describe("Encrypting and decrypting a string", () => {
//   it("should encrypt and decrypt a string", async () => {
let litNodeClient;
// const ethersSigner = getEthersSigner("4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc");
litNodeClient = await getLitNodeClient();

// const accessControlConditions = [
//   {
//     contractAddress: "",
//     standardContractType: "",
//     chain: "ethereum",
//     method: "",
//     parameters: [":userAddress"],
//     returnValueTest: {
//       comparator: "=",
//       value: await ethersSigner.getAddress(),
//     },
//   },
// ];

const { ciphertext, dataToEncryptHash, accessControlConditions } = await runExample();
console.log(`ℹ️  ciphertext: ${ciphertext}`);
console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);
console.log(`ℹ️  accessControlConditions: ${accessControlConditions}`);

async function decryptData(ciphertext, dataToEncryptHash, accessControlConditions) {
    // Initialize LitNodeClient
    const litNodeClient = new LitNodeClient({
        litNetwork: "datil-dev",
        debug: false,
    });
    await litNodeClient.connect();

    // Get session signatures
    const sessionSigs = await litNodeClient.getSessionSigs({
        chain: "ethereum",
        expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
        resourceAbilityRequests: [
            {
                resource: new LitAccessControlConditionResource('*'),
                ability: LIT_ABILITY.AccessControlConditionDecryption,
            },
        ],
        authNeededCallback: async ({ uri, expiration, resourceAbilityRequests }) => {
            const toSign = await createSiweMessage({
                uri,
                expiration,
                resources: resourceAbilityRequests,
                walletAddress: ethersWallet.address,
                nonce: await litNodeClient.getLatestBlockhash(),
                litNodeClient,
            });

            return await generateAuthSig({
                signer: ethersWallet,
                toSign,
            });
        },
    });
    const decryptedString = await litNodeClient.decrypt(
        {
            accessControlConditions,
            chain: "ethereum",
            ciphertext,
            dataToEncryptHash,
            sessionSigs,
        },
        litNodeClient,
    );

    // Decrypt the message
    // const decryptedString = await LitJsSdk.decryptToString(
    //   {
    //     chain: "ethereum",
    //     ciphertext,
    //     dataToEncryptHash,
    //     accessControlConditions,
    //     sessionSigs,
    //   },
    //   litNodeClient
    // );
    const textDecoder = new TextDecoder();
    const decryptedString2 = textDecoder.decode(new Uint8Array(decryptedString.decryptedData));
    console.log(`ℹ️  decryptedString: ${decryptedString2}`);
    // console.log(`ℹ️  decryptedString: ${decryptedString.decryptedData}`);
    return decryptedString;
}
decryptData(ciphertext, dataToEncryptHash, accessControlConditions);
// expect(decryptedString).to.equal(
//   "The answer to life, the universe, and everything is 42."
// );
//   }).timeout(120_000);
// });
// const litNodeClient = new LitNodeClient({
//     litNetwork: LIT_NETWORK.DatilDev,
//     debug: false
//   });
//   await litNodeClient.connect();
// const sessionSigs = await litNodeClient.getSessionSigs({
//     chain: "ethereum",
//     expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
//     resourceAbilityRequests: [
//         {
//             resource: new LitAccessControlConditionResource(
//                 await LitAccessControlConditionResource.generateResourceString(
//                     accessControlConditions,
//                     dataToEncryptHash
//                 )
//             ),
//             ability: LIT_ABILITY.AccessControlConditionDecryption,
//         },
//     ],
//     authNeededCallback: async ({
//         uri,
//         expiration,
//         resourceAbilityRequests,
//         }) => {
//         const toSign = await createSiweMessage({
//             uri,
//             expiration,
//             resources: resourceAbilityRequests,
//             walletAddress: ethersWallet.address,
//             nonce: await litNodeClient.getLatestBlockhash(),
//             litNodeClient,
//         });

//         return await generateAuthSig({
//             signer: ethersWallet,
//             toSign,
//         });
//     },
// });

// const decryptionResult = await LitJsSdk.decryptToString(
//     {
//         chain: "ethereum",
//         ciphertext,
//         dataToEncryptHash,
//         accessControlConditions,
//         sessionSigs,
//     },
//     litNodeClient
//   );

//   console.log(`ℹ️  decryptedString: ${decryptionResult}`);

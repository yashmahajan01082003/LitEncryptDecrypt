import { LIT_ABILITY } from "@lit-protocol/constants";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { getEthersSigner, getLitNodeClient } from "./utils.js";
import crypto from 'crypto';
import { createSiweMessage, generateAuthSig, LitAccessControlConditionResource } from "@lit-protocol/auth-helpers";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { ethers } from "ethers";
import fs from 'fs'; // Ensure you're using 'import' for fs

global.crypto = crypto; // Make crypto globally available

// Define your Ethereum private key here
const ETHEREUM_PRIVATE_KEY = '4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc';

const ethersWallet = new ethers.Wallet(ETHEREUM_PRIVATE_KEY);

let litNodeClient;
litNodeClient = await getLitNodeClient();

// Function to read PDF file as binary data
function readPdfFile(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath); // Using fs.readFileSync to read the file
        return fileBuffer;
    } catch (err) {
        console.error(`Error reading PDF file at ${filePath}:`, err);
        return null;
    }
}

// Function to save the decrypted PDF
function saveDecryptedPdf(decryptedData, outputPath) {
    try {
        fs.writeFileSync(outputPath, decryptedData); // Using fs.writeFileSync to save the decrypted data
        console.log(`Decrypted PDF saved to: ${outputPath}`);
    } catch (err) {
        console.error(`Error saving decrypted PDF:`, err);
    }
}

// Function to run the encryption example for PDFs
export const runExample = async () => {
    let litNodeClient;

    try {
        const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
        litNodeClient = await getLitNodeClient();

        const pdfFilePath = './A.pdf'; // Path to the PDF file to encrypt
        const pdfData = readPdfFile(pdfFilePath);
        if (!pdfData) {
            throw new Error(`Failed to read PDF file at ${pdfFilePath}`);
        }

        // Define the access control conditions
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

        // Encrypt the entire PDF file binary data
        const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
            dataToEncrypt: pdfData,
            accessControlConditions,
        });

        console.log(`ℹ️  ciphertext: ${ciphertext}`);
        console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);

        return { ciphertext, dataToEncryptHash, accessControlConditions };
    } catch (error) {
        console.error("Error encrypting PDF:", error);
        return null; // Ensure the function returns null in case of failure
    }
};

// Function to decrypt the encrypted PDF file and save it
export const decryptData = async (ciphertext, dataToEncryptHash, accessControlConditions) => {
    let litNodeClient;

    try {
        litNodeClient = await getLitNodeClient();

        const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
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
                    walletAddress: ethersSigner.address,
                    nonce: await litNodeClient.getLatestBlockhash(),
                    litNodeClient,
                });

                return await generateAuthSig({
                    signer: ethersSigner,
                    toSign,
                });
            },
        });

        // Decrypt the PDF binary data
        const decryptedData = await litNodeClient.decrypt(
            {
                accessControlConditions,
                chain: "ethereum",
                ciphertext,
                dataToEncryptHash,
                sessionSigs,
            },
            litNodeClient,
        );

        // Save the decrypted PDF to the specified output path
        saveDecryptedPdf(decryptedData.decryptedData, './decrypted_output.pdf');
    } catch (error) {
        console.error("Error decrypting PDF:", error);
    }
};

// Example usage
const encryptionResult = await runExample();

// Check if encryption was successful before proceeding
if (encryptionResult) {
    const { ciphertext, dataToEncryptHash, accessControlConditions } = encryptionResult;
    // Decrypt the PDF using the ciphertext
    await decryptData(ciphertext, dataToEncryptHash, accessControlConditions);
} else {
    console.error("Encryption failed, cannot proceed with decryption.");
}

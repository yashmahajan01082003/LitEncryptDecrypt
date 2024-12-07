import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { getEthersSigner, getLitNodeClient } from "./utils.js";
import fs from 'fs';
import { createSiweMessage, generateAuthSig } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY, LIT_NETWORK } from "@lit-protocol/constants";
import { ethers } from "ethers";

const ETHEREUM_PRIVATE_KEY = "4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc";

// Function to read the PDF file as binary data (entire file)
function readPdfFile(filePath) {
    try {
        // Read the file as a binary buffer
        const fileBuffer = fs.readFileSync(filePath);
        return fileBuffer;
    } catch (err) {
        console.error(`Error reading PDF file at ${filePath}:`, err);
        return null;
    }
}

// Function to save the decrypted PDF (write the binary data to a new file)
function saveDecryptedPdf(decryptedData, outputPath) {
    try {
        // Write the decrypted data (binary) to a new PDF file
        fs.writeFileSync(outputPath, decryptedData);
        console.log(`Decrypted PDF saved to: ${outputPath}`);
    } catch (err) {
        console.error(`Error saving decrypted PDF:`, err);
    }
}

// Run the encryption example for PDFs (encrypt the file directly)
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
    }
};

// Function to decrypt the encrypted PDF file and save it
export const decryptPdf = async (ciphertext, dataToEncryptHash, accessControlConditions, outputPdfPath) => {
    let litNodeClient;

    try {
        litNodeClient = await getLitNodeClient();

        const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
        const sessionSigs = await litNodeClient.getSessionSigs({
            chain: "ethereum",
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            resourceAbilityRequests: [
                {
                    resource: "*",
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
        saveDecryptedPdf(decryptedData.decryptedData, outputPdfPath);

    } catch (error) {
        console.error("Error decrypting PDF:", error);
    }
};

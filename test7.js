import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { getEthersSigner, getLitNodeClient } from "./utils.js";
import fs from 'fs';

const ETHEREUM_PRIVATE_KEY = "4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc";

// Read IPODetails.json and convert it to a string
function readIPODetailsJson() {
    const filePath = './IPODetails.json'; // Adjust the path if necessary
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data); // Convert JSON string to object
    } catch (err) {
        console.error("Error reading IPODetails.json:", err);
        return null;
    }
}

// Run the encryption example
export const runExample = async () => {
    let litNodeClient;

    try {
        const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
        litNodeClient = await getLitNodeClient();

        // Read IPODetails.json and convert it to a string
        const ipoDetails = readIPODetailsJson();
        if (!ipoDetails) {
            throw new Error("Failed to read IPODetails.json");
        }

        const ipoDetailsString = JSON.stringify(ipoDetails); // Convert to string

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

        // Encrypt the JSON string using Lit protocol
        const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
            dataToEncrypt: new TextEncoder().encode(ipoDetailsString),
            accessControlConditions,
        });

        console.log(`ℹ️  ciphertext: ${ciphertext}`);
        console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);

        return { ciphertext, dataToEncryptHash, accessControlConditions };
    } catch (error) {
        console.error(error);
    }
};

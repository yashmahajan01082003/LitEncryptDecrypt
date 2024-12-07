import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { encryptString, decryptToString } from "lit-protocol/encryption";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import * as ethers from "ethers";

const litNodeClient = new LitNodeClient({
  litNetwork: LIT_NETWORK.DatilDev,
  debug: false
});
await litNodeClient.connect();
console.log("Connected to Lit Protocol");
const ethersWallet = new ethers.Wallet(
  "4560901e92310976371c75c3e9bcfb6512b8091594cc51021be9e13c6bc5d7bc", // Replace with your private key
  new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const accessControlConditions = [
    {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
        comparator: "=",
        value: ethersWallet.address, // <--- The address of the wallet that can decrypt the data
        },
    },
];

const dataToEncrypt = "The answer to the universe is 42.";

const { ciphertext, dataToEncryptHash } = await encryptString(
    {
        accessControlConditions,
        dataToEncrypt,
    },
    litNodeClient
);

console.log(`ℹ️  ciphertext: ${ciphertext}`);
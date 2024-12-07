import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
// import { ethers } from "ethers";
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitNetwork } from '@lit-protocol/constants';


const accessControlConditions = [
  {
    contractAddress: "",
    standardContractType: "",
    chain: "ethereum",
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=",
      value: "0x5ee1eA1372fbaE0dDe19d7f9f9c2dfC24Dca587A", // Replace with the hardcoded address
    },
  },
];
class Lit {
  litNodeClient;
  chain;

  constructor(chain) {
    this.chain = chain;
  }
  
  async encrypt(message) {
    // Encrypt the message
    const { ciphertext, dataToEncryptHash } = await this.litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(
        "The answer to life, the universe, and everything is 42."
      ),
      accessControlConditions,
    });

    console.log(`ℹ️  ciphertext: ${ciphertext}`);
    console.log(`ℹ️  dataToEncryptHashh: ${dataToEncryptHash}`);

    // Return the ciphertext and dataToEncryptHash
   console.log(ciphertext, dataToEncryptHash);
  }
  async connect() {
    this.litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: LIT_NETWORK.DatilDev,
      debug: false,
    });
    await this.litNodeClient.connect();
    console.log("Connected to Lit Protocol");
  }

  
}
const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: false
  });

await litNodeClient.connect();
console.log('Connected to Lit Network');
await litNodeClient.encrypt("Hello my name is John Doe");
// console.log(ciphertext, dataToEncryptHash);

import { ethers } from "ethers";

export const MASQ_TOKEN_ADDRESS = "your_masq_token_address_here";
export const MQART_ADDRESS = "your_mqart_address_here";
export const MASQ_TOKEN_ABI = [];
export const MQART_ABI = [];

export const initializeProvider = () => {
  if (typeof window === "undefined") {
    console.warn(
      "initializeProvider: Window object not available on the server."
    );
    return null;
  }

  const windowWithEthereum = window;

  if (windowWithEthereum.ethereum) {
    return new ethers.BrowserProvider(windowWithEthereum.ethereum);
  } else {
    console.warn("initializeProvider: Web3Provider not available.");
    return null;
  }
};

// export const getProviderAndSigner = () => {
//   const provider = initializeProvider();

//   if (provider) {
//     const signer = provider.getSigner();
//     return { provider, signer };
//   } else {
//     return { provider: null, signer: null };
//   }
// };

export const provider = initializeProvider();
export const signer = provider ? provider.getSigner() : null;

// export const mQartContract = signer
//   ? new ethers.Contract(MQART_ADDRESS, MQART_ABI, signer)
//   : null;

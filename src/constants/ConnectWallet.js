import { ethers } from "ethers";
import { useGlobalContext } from "@/context/Store";

import { MASQ_TOKEN_ADDRESS } from "./index";

export default async function ConnectWallet() {
  const { setUserAddress, setNativeBalance, setTokenBalance } =
    useGlobalContext();

  try {
    if (!window.ethereum) {
      throw new Error(
        "Your browser doesn't seem to support connecting to Ethereum wallets. Please consider using a compatible browser like Chrome, Firefox, or Brave with a wallet extension like MetaMask."
      );
    }

    const ethereum = window.ethereum;
    const provider = new ethers.BrowserProvider(ethereum);

    // Get current network details
    const network = await provider.getNetwork();
    const isAmoyNetwork = network.chainId === 80002;

    // Request accounts securely (avoiding deprecated 'eth_requestAccounts')
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    // Handle user rejection
    if (accounts.length === 0) {
      console.log("User rejected account connection.");
      return;
    }

    if (!isAmoyNetwork) {
      // User confirmation for switching network (recommended)
      const shouldSwitchNetwork = confirm(
        "This app requires Amoy Testnet. Switch network?"
      );

      if (shouldSwitchNetwork) {
        try {
          // Attempt to switch using a standard provider method (if available)
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
              {
                chainId: "0x13882",
              },
            ],
          });
        } catch (switchError) {
          // Handle potential switch errors gracefully
          console.error("Failed to switch to Amoy Testnet:", switchError);
          alert(
            "Switching failed. Please switch to Amoy Testnet manually in your wallet settings."
          );
          return;
        }
      } else {
        console.log("User declined network switch.");
        return; // Handle user declining network switch
      }
    }

    const [address] = accounts;
    setUserAddress(address);

    // Fetch the native balance (ETH)
    const nativeBalance = await provider.getBalance(address);
    setNativeBalance(ethers.formatEther(nativeBalance)); // Assuming setNativeBalance expects a string

    // Fetch the token balance if necessary
    // Example token contract address and ABI (replace with actual values)
    const tokenAddress = "0xYourTokenContractAddress"; // Replace with actual token contract address
    const tokenABI = [
      // Minimal ABI to get ERC20 Token balance
      "function balanceOf(address owner) view returns (uint256)",
    ];
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
    const tokenBalance = await tokenContract.balanceOf(address);
    setTokenBalance(ethers.formatEther(tokenBalance)); // Assuming setTokenBalance expects a string

    // Subscribe to account changes
    ethereum.on("accountsChanged", (newAccounts) => {
      const newAddress = newAccounts.length > 0 ? newAccounts[0] : "";
      setUserAddress(newAddress); // Update address in your application
      console.log("Account changed, new address:", newAddress);

      // Update balances on account change
      provider.getBalance(newAddress).then((newBalance) => {
        setNativeBalance(ethers.formatEther(newBalance));
      });
      tokenContract.balanceOf(newAddress).then((newTokenBalance) => {
        setTokenBalance(ethers.formatEther(newTokenBalance));
      });
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

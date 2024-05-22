import { ethers } from "ethers";
import { useGlobalContext } from "@/context/Store";

import { MASQ_TOKEN_ADDRESS } from "./index";

export async function ConnectWallet() {
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

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    // Handle user rejection
    if (accounts.length === 0) {
      console.log("User rejected account connection.");
      return;
    }

    const [address] = accounts;
    setUserAddress(address);

    // Fetch the native balance (ETH)
    const nativeBalance = await provider.getBalance(address);
    setNativeBalance(ethers.formatEther(nativeBalance)); // Assuming setNativeBalance expects a string

    // Fetch the token balance if necessary
    const tokenABI = [
      // Minimal ABI to get ERC20 Token balance
      "function balanceOf(address owner) view returns (uint256)",
    ];
    const tokenContract = new ethers.Contract(
      MASQ_TOKEN_ADDRESS,
      tokenABI,
      provider
    );
    const tokenBalance = await tokenContract.balanceOf(address);
    setTokenBalance(ethers.formatEther(tokenBalance)); // Assuming setTokenBalance expects a string

    // Subscribe to account changes
    ethereum.on("accountsChanged", async (newAccounts) => {
      const newAddress = newAccounts.length > 0 ? newAccounts[0] : "";
      setUserAddress(newAddress); // Update address in your application
      console.log("Account changed, new address:", newAddress);

      // Update balances on account change
      if (newAddress) {
        const newNativeBalance = await provider.getBalance(newAddress);
        setNativeBalance(ethers.formatEther(newNativeBalance));
        const newTokenBalance = await tokenContract.balanceOf(newAddress);
        setTokenBalance(ethers.formatEther(newTokenBalance));
      } else {
        setNativeBalance("0");
        setTokenBalance("0");
      }
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

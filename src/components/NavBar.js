import Image from "next/image";
import Link from "next/link";
import ShoppingCart from "./ShoppingCart";
import { useGlobalContext } from "@/context/Store";
import { useEffect } from "react";
import { ethers } from "ethers";

const MASQ_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MASQ_TOKEN_ADDRESS;

export default function NavBar() {
  const {
    cartCount,
    userAddress,
    setUserAddress,
    setNativeBalance,
    setTokenBalance,
  } = useGlobalContext();

  const handleCartClick = async () => {
    // Logic for handling cart click if necessary
  };

  const ConnectWallet = async () => {
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
      console.error("Install metamask OR unable to call", error);
    }
  };

  useEffect(() => {
    ConnectWallet();
  }, []); // Empty dependency array to run only once on mount

  return (
    <nav className="py-5 px-12 flex justify-between">
      <Link href="/">
        <p className="bg-white text-3xl font-bold underline underline-offset-4 decoration-wavy decoration-2 decoration-emerald-500 cursor-pointer">
          MQart
        </p>
      </Link>
      {userAddress && userAddress.length > 0 ? (
        <p className="bg-purple-50 hover:bg-purple-500 hover:text-white transition-colors duration-500 text-purple-500 rounded-md px-5 py-2">
          {userAddress}
        </p>
      ) : (
        <button
          onClick={ConnectWallet}
          className="bg-purple-50 hover:bg-purple-500 hover:text-white transition-colors duration-500 text-purple-500 rounded-md px-5 py-2"
        >
          Connect Wallet
        </button>
      )}
      <button className="relative" onClick={handleCartClick}>
        <Image
          src="/cart.svg"
          width={40}
          height={40}
          alt="shopping cart icon"
        />
        <div className="rounded-full flex justify-center items-center bg-emerald-500 text-xs text-white absolute w-6 h-5 bottom-6 -right-1">
          {cartCount}
        </div>
      </button>

      <ShoppingCart />
    </nav>
  );
}

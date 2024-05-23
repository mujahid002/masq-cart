import Image from "next/image";
import Link from "next/link";
import ShoppingCart from "./ShoppingCart";
import { useGlobalContext } from "../context/Store";
import { useEffect } from "react";
import { ethers } from "ethers";
import {
  // tMasqContract,
  tMasqContractWithSigner,
  mQartContractWithSigner,
} from "@/constants";

const MASQ_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_MASQ_TOKEN_ADDRESS;

export default function NavBar() {
  const {
    cartCount,
    userAddress,
    shouldDisplayCart,
    nativeBalance,
    tokenBalance,
    maticPrice,
    masqPrice,
    setShouldDisplayCart,
    setUserAddress,
    setNativeBalance,
    setTokenBalance,
  } = useGlobalContext();

  const handleCartClick = async () => {
    shouldDisplayCart
      ? setShouldDisplayCart(false)
      : setShouldDisplayCart(true);
  };

  const ConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error(
          "Your browser doesn't seem to support connecting to Ethereum wallets. Please consider using a compatible browser like Chrome, Firefox, or Brave with a wallet extension like MetaMask."
        );
      }

      const ethereum = window.ethereum;
      const provider = new ethers.providers.Web3Provider(ethereum);

      // Get current network details
      const network = await provider.getNetwork();
      const isAmoyNetwork = network.chainId === 80002;

      // if (!isAmoyNetwork) {
      //   const confirmed = confirm(
      //     "This app needs the Amoy testnet. Would you like to switch networks?"
      //   );
      //   if (confirmed) {
      //     try {
      //       await ethereum.request({
      //         method: "wallet_switchEthereumChain",
      //         params: [{ chainId: "0x13882" }], // Switch to Amoy testnet (80002)
      //       });
      //       // After switching, fetch accounts again
      //       const accounts = await ethereum.request({
      //         method: "eth_requestAccounts",
      //       });
      //       if (accounts.length === 0) {
      //         console.log("User rejected account connection.");
      //         return;
      //       }
      //       setUserAddress(accounts[0]);
      //     } catch (switchError) {
      //       // Handle error when switching networks
      //       console.error("Error switching network:", switchError);
      //     }
      //   } else {
      //     return;
      //   }
      // }

      // If already on the correct network or after switching
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
      setNativeBalance(ethers.utils.formatEther(nativeBalance)); // Assuming setNativeBalance expects a string

      // Fetch the token balance if necessary

      // const tokenBalance = await tMasqContractWithSigner.balanceOf(address);
      // setTokenBalance(ethers.utils.formatEther(tokenBalance).toString());

      // Subscribe to account changes
      ethereum.on("accountsChanged", async (newAccounts) => {
        const newAddress = newAccounts.length > 0 ? newAccounts[0] : "";
        setUserAddress(newAddress); // Update address in your application
        console.log("Account changed, new address:", newAddress);

        // Update balances on account change
        if (newAddress) {
          const newNativeBalance = await provider.getBalance(newAddress);
          setNativeBalance(ethers.utils.formatEther(newNativeBalance));
          const newTokenBalance = await tokenContract.balanceOf(newAddress);
          setTokenBalance(ethers.utils.formatEther(newTokenBalance));
        } else {
          setNativeBalance("0");
          setTokenBalance("0");
        }
      });
      if (userAddress && userAddress.length > 0) {
        await getTokenBalance(userAddress);
      }
    } catch (error) {
      console.error("Install metamask OR unable to call", error);
    }
  };

  const getTokenBalance = async (address) => {
    try {
      if (!tMasqContractWithSigner) {
        console.error("tMasqContractWithSigner is not initialized.");
        return;
      }
      // Call balanceOf function
      const tokenBalance = await tMasqContractWithSigner.balanceOf(address);
      setTokenBalance(ethers.utils.formatEther(tokenBalance).toString());
    } catch (error) {
      console.error("Error fetching token balance:", error);
      // Optionally, provide user feedback here
    }
  };

  useEffect(() => {
    ConnectWallet();
  }, []); // Empty dependency array to run only once on mount

  return (
    <nav className="py-5 px-12 flex justify-between items-center">
      <Link href="/">
        <p className="bg-white text-3xl font-bold underline underline-offset-4 decoration-wavy decoration-2 decoration-emerald-500 cursor-pointer">
          MQart
        </p>
      </Link>
      {userAddress && userAddress.length > 0 ? (
        <div className="flex flex-col items-center">
          <p className="text-purple-500">{userAddress}</p>
          <div className="flex gap-4 items-center justify-center">
            <p className="text-purple-500">
              {nativeBalance
                ? "MATIC: " +
                  parseFloat(nativeBalance).toFixed(2) +
                  `(~$${(maticPrice * parseFloat(nativeBalance)).toFixed(2)})`
                : "Loading..."}
            </p>
            {tokenBalance && tokenBalance.length > 0 ? (
              <p className="text-purple-500">
                {nativeBalance
                  ? "MASQ: " +
                    parseFloat(tokenBalance).toFixed(2) +
                    `(~$${(masqPrice * parseFloat(tokenBalance)).toFixed(2)})`
                  : "Loading..."}
              </p>
            ) : (
              <button
                onClick={() => getTokenBalance(userAddress)}
                className="bg-purple-50 hover:bg-purple-500 hover:text-white transition-colors duration-500 text-purple-500 rounded-md"
              >
                Check tMasq
              </button>
            )}
          </div>
        </div>
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

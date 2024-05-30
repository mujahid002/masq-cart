import Image from "next/image";
import Link from "next/link";
import ShoppingCart from "./ShoppingCart";
import { useGlobalContext } from "../context/Store";
import { useEffect } from "react";
import { ethers } from "ethers";
import { provider, tMASQ_TOKEN_ADDRESS } from "../constants/index";

export default function NavBar() {
  const {
    orderId,
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

      await checkNetwork();

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
      if (userAddress && userAddress.length > 0) {
        await getTokenBalance(userAddress);
      }
      // Subscribe to account changes
      ethereum.on("accountsChanged", async (newAccounts) => {
        const newAddress = newAccounts.length > 0 ? newAccounts[0] : "";
        setUserAddress(newAddress); // Update address in your application
        console.log("Account changed, new address:", newAddress);

        // Update balances on account change
        if (newAddress) {
          const newNativeBalance = await provider.getBalance(newAddress);
          setNativeBalance(ethers.utils.formatEther(newNativeBalance));
          if (userAddress && userAddress.length > 0) {
            await getTokenBalance(userAddress);
          }
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
      // Fetch Token Balance
      const tokenDataResponse = await fetch(
        `https://api-amoy.polygonscan.com/api?module=account&action=tokenbalance&contractaddress=${tMASQ_TOKEN_ADDRESS}&address=${address}&tag=latest&apikey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`
      );

      if (!tokenDataResponse.ok) {
        throw new Error("Failed to fetch token balance");
      }

      const tokenData = await tokenDataResponse.json();
      // console.log(tokenData.result);

      if (tokenData.status !== "1" || !tokenData.result) {
        throw new Error("Unexpected response from API");
      }

      const tokenBalance = tokenData.result;

      // console.log(tokenBalance)
      if (isNaN(tokenBalance)) {
        console.error("Token balance parsing issue:", tokenData.result);
        throw new Error("Invalid token balance");
      }

      setTokenBalance(ethers.utils.formatEther(tokenBalance));
      console.log(tokenBalance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  const checkNetwork = async () => {
    try {
      const network = await provider.getNetwork();

      const isAmoyNetwork = network.chainId === 80002;
      if (!isAmoyNetwork) {
        alert(`Change your network to Amoy Testnet`);
      }
    } catch (error) {
      console.error("Unable to call checkNetwork function", error);
    }
  };

  useEffect(() => {
    ConnectWallet();
  }, [userAddress]);
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

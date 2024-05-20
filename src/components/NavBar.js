import Image from "next/image";
import Link from "next/link";
import ShoppingCart from "./ShoppingCart";
import { useGlobalContext } from "@/context/Store";
import { ConnectWallet } from "@/constants/ConnectWallet";

export default function NavBar() {
  const { cartCount, userAddress } = useGlobalContext();

  const handleCartClick = async () => {
    // Logic for handling cart click if necessary
  };

  const handleConnectWallet = () => {
    // Logic to connect wallet
  };

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
          onClick={ConnectWallet()}
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

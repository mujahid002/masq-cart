import Image from "next/image";
import { useGlobalContext } from "../context/Store";
import { useState } from "react";

export default function CartItem({ item }) {
  const { name, emoji, quantity, price, id } = item;
  const { cartCount, cartItems, setShouldDisplayCart, removeItemFromCart } =
    useGlobalContext();

  const handleRemoveItem = () => {
    removeItemFromCart(id);
    if (cartItems.length === 1 && cartItems[0].id === id) {
      setShouldDisplayCart(false);
    }
    // alert(`Cart count is now ${cartCount - quantity}`);
  };

  return (
    <div className="flex items-center gap-4 mb-3">
      <p className="text-4xl">{emoji}</p>
      {/* <p className="text-4xl">{quantity}</p> */}
      <div>
        {name} <span className="text-xs">({quantity})</span>
      </div>
      <div className="ml-auto">
        {(parseFloat(price) * parseFloat(quantity)).toFixed(4)}
      </div>
      <button
        onClick={handleRemoveItem}
        className="hover:bg-emerald-50 transition-colors rounded-full duration-500 p-1"
      >
        <Image alt="delete icon" src="/trash.svg" width={20} height={20} />
      </button>
    </div>
  );
}

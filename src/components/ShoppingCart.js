import { useState } from "react";
import CartItem from "./CartItem";
import CheckoutButton from "./CheckoutButton";
import { useGlobalContext } from "@/context/Store";

const items = [];

export default function ShoppingCart() {
  const { shouldDisplayCart, setShouldDisplayCart, cartCount } =
    useGlobalContext();
  return (
    <div
      className={`bg-white flex flex-col absolute right-3 md:right-9 top-14 w-80 py-4 px-4 shadow-[0_5px_15px_0_rgba(0,0,0,.15)] rounded-md transition-opacity duration-500 ${
        shouldDisplayCart ? "opacity-100" : "opacity-0"
      }`}
    >
      {cartCount && cartCount > 0 ? (
        <>
          {items.map((item) => (
            <CartItem item={item} key={item.id} />
          ))}
          <CheckoutButton />
        </>
      ) : (
        <div className="p-5">You have no items in your cart</div>
      )}
    </div>
  );
}

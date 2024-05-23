import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import MaticCheckOut from "./MaticCheckOut";
import MasqCheckOut from "./MaticCheckOut";
import { useGlobalContext } from "../context/Store";

export default function ShoppingCart() {
  const {
    userAddress,
    shouldDisplayCart,
    maticPrice,
    masqPrice,
    cartCount,
    cartItems,
  } = useGlobalContext();

  const [maticAmount, setMaticAmount] = useState(0);
  const [masqAmount, setMasqAmount] = useState(0);

  useEffect(() => {
    // Calculate Matic amount
    let maticTotal = 0;
    cartItems.forEach((item) => {
      const { quantity, price } = item;
      const totalMatic = (price * quantity) / maticPrice;
      maticTotal += totalMatic;
    });
    setMaticAmount(maticTotal);

    // Calculate Masq amount
    let masqTotal = 0;
    cartItems.forEach((item) => {
      const { quantity, price, discount } = item;
      const discountedPrice = (price * (100 - discount)) / 100;
      console.log(discount);
      const totalMasq = (discountedPrice * quantity) / masqPrice; // Calculate total in Masq for this item
      masqTotal += totalMasq; // Accumulate total Masq amount
    });
    setMasqAmount(masqTotal); // Update state with total Masq amount
  }, [cartItems, maticPrice, masqPrice]);

  return (
    <div
      className={`bg-white flex flex-col absolute right-3 md:right-9 top-14 w-80 py-4 px-4 shadow-[0_5px_15px_0_rgba(0,0,0,.15)] rounded-md transition-opacity duration-500 ${
        shouldDisplayCart ? "opacity-100" : "opacity-0"
      }`}
    >
      {cartCount && cartCount > 0 ? (
        <>
          {Object.values(cartItems ?? {}).map((entry) => (
            <CartItem key={entry.id} item={entry} />
          ))}
          <MaticCheckOut amount={maticAmount.toFixed(4)} />
          <MasqCheckOut amount={masqAmount.toFixed(4)} />
          <p>
            Total in Matic: {maticAmount.toFixed(4)} (~${" "}
            {(maticAmount * maticPrice).toFixed(2)})
          </p>
          <p>
            Total in Masq: {masqAmount.toFixed(4)} (~${" "}
            {(masqAmount * masqPrice).toFixed(2)})
          </p>
        </>
      ) : (
        <div className="p-5">You have no items in your cart</div>
      )}
    </div>
  );
}

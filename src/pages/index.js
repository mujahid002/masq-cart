import React, { useEffect } from "react";
import Product from "../components/Product";
import { products } from "../data/products";
import { useGlobalContext } from "../context/Store";
import { getPrices } from "../data/products"; // Assuming this is the correct import for getPrices

export default function Home() {
  const {
    cartCount,
    maticPrice,
    masqPrice,
    setShouldDisplayCart,
    removeItemFromCart,
    setMaticPrice,
    setMasqPrice,
  } = useGlobalContext();

  useEffect(() => {
    const fetchPrices = async () => {
      const prices = await getPrices();
      if (!prices.error) {
        setMaticPrice(prices.maticPrice);
        setMasqPrice(prices.masqPrice);
      }
    };

    // Call the function initially
    fetchPrices();

    // Set up an interval to call the function every 10 seconds
    // const intervalId = setInterval(() => {
    //   console.log("Calling fetchPrices...");
    //   fetchPrices();
    // }, 10000);

    // // Clear the interval when the component is unmounted
    // return () => {
    //   clearInterval(intervalId);
    //   console.log("Interval cleared.");
    // };
  }, [setMaticPrice, setMasqPrice]);

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-4 justify-center mx-auto gap-4 place-center flex-wrap w-100 md:max-w-[900px]">
      {products.map((product) => (
        <Product product={product} key={product.id} />
      ))}
      {/* Note component */}
      <div className="col-span-full text-center mt-4">
        <p>1 Matic ~ ${maticPrice}</p>
        <p>1 Masq ~ ${masqPrice}</p>
      </div>
      <div className="col-span-full text-center mt-4">
        <p>
          Note: Prices of products are assumed for testing purposes in USD and
          updated Matic & Masq prices according to product price.
        </p>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Product from "../components/Product";
import { getDeposits, products } from "../data/products";
import { useGlobalContext } from "../context/Store";
import { getPrices } from "../data/products"; // Assuming this is the correct import for getPrices
import { WithdrawMasq, WithdrawMatic } from "../components/Withdraw";
import { mQartContractWithProvider } from "../constants";

import { ethers } from "ethers";
export default function Home() {
  const {
    orderId,
    maticPrice,
    masqPrice,
    setMaticPrice,
    setMasqPrice,
    maticDeposits,
    setMaticDeposits,
    masqDeposits,
    setMasqDeposits,
    setOrderId,
  } = useGlobalContext();

  const [succesOrders, setSuccessOrders] = useState(0);

  const fetchAll = async () => {
    const prices = await getPrices();
    const deposits = await getDeposits();
    const id = await mQartContractWithProvider.s_orderId();
    setOrderId(parseFloat(ethers.BigNumber.from(id)));
    const totalIds = await mQartContractWithProvider.totalSupply();
    setSuccessOrders(parseFloat(ethers.BigNumber.from(totalIds)));
    if (!prices.error && !deposits.error) {
      setMaticDeposits(deposits.maticDeposits);
      setMasqDeposits(deposits.masqDeposits);
      setMaticPrice(prices.maticPrice);
      setMasqPrice(prices.masqPrice);
    }
  };

  useEffect(() => {
    // Call the function initially
    fetchAll();

    // Set up an interval to call the function every 10 seconds
    // const intervalId = setInterval(() => {
    //   console.log("Calling fetchAll...");
    //   fetchAll();
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

      {/* Container to place WithdrawMatic and WithdrawMasq in corners */}
      <div className="flex justify-center mt-4">
        Total Matic: {maticDeposits}
      </div>
      <div className="flex justify-center mt-4">
        <WithdrawMatic />
      </div>
      <div className="flex  justify-center mt-4">
        Total Masq: {masqDeposits}
      </div>
      <div className="flex justify-center mt-4">
        <WithdrawMasq />
      </div>

      {/* Note component */}
      <div className="col-span-full text-center mt-4">
        <p>Current Order: {orderId}</p>
        <p>Succesfull Orders: {succesOrders}</p>
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

import { useState } from "react";
import { mQartContractWithSigner, mQartContract } from "../constants/index";
import { ethers } from "ethers";
import { useGlobalContext } from "../context/Store";
import axios from "axios";

export default function MaticCheckOut({ amount }) {
  const { setOrderId } = useGlobalContext();

  const [status, setStatus] = useState("idle");
  const { userAddress } = useGlobalContext();

  const createOrderId = async () => {
    try {
      const orderAmount = ethers.utils.parseEther(amount.toString()).toString();
      console.log("the amount is: ", orderAmount);
      const data = {
        userAddress: userAddress,
        orderAmount: amount,
        orderNature: true,
      };

      const res = await axios.post(
        "http://localhost:8888/create-orderId",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("The response is", res.data);

      if (res.data.success) {
        const newOrderId = await res.data;
        const orderId = await newOrderId.orderId;
        console.log("The order id is", res.data.orderId);
        setOrderId(orderId);
        return orderId;
      } else {
        console.error("Failed to create orderId:", res.data.message);
      }
    } catch (error) {
      console.error("Error creating order ID:", error);
    }
  };

  const maticPayment = async () => {
    setStatus("loading");
    try {
      const amountString = amount.toString();
      if (isNaN(parseFloat(amountString))) {
        console.error("Invalid amount value");
        setStatus("error");
        return;
      }

      let orderId = await createOrderId();
      if (!orderId) {
        console.log("Unable to create orderId");
        setStatus("error");
        return;
      }
      alert(`Your orderId is ${orderId}`);

      const parsedValue = ethers.utils.parseEther(amountString);
      console.log("Parsed value is", parsedValue.toString());

      if (!mQartContractWithSigner) {
        console.error("Contract is not connected with a signer");
        setStatus("error");
        return;
      }

      const trx = await mQartContract.depositNative(orderId, {
        value: parsedValue,
        gasLimit: 5000000,
      });

      await trx;
      console.log(trx);
      setStatus("success");
    } catch (error) {
      console.error("Payment failed", error);
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <article className="mt-3 flex flex-col">
      {status === "error" && (
        <div className="text-red-700 text-xs mb-3 h-5 text-center">
          Unable to process payment
        </div>
      )}
      <button
        onClick={maticPayment}
        className="bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-colors duration-500 text-emerald-500 py-3 px-5 rounded-md w-full"
      >
        {status !== "loading" ? "Pay with Matic" : "Loading..."}
      </button>
    </article>
  );
}

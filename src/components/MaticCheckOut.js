import { useState } from "react";
import { mQartContractWithSigner } from "../constants/index";
import { ethers } from "ethers"; // Ensure ethers is imported
import { useGlobalContext } from "../context/Store";
import axios from "axios";

export default function MaticCheckOut({ amount }) {
  const { userAddress } = useGlobalContext();
  const [status, setStatus] = useState("idle");
  const [orderId, setOrderId] = useState(null);

  const createOrderId = async () => {
    try {
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
        // Access orderId from response data
        const newOrderId = res.data.orderId;
        setOrderId(newOrderId);
        console.log("The order id is", orderId);
        return;
      } else {
        console.error("Failed to create orderId:", res.data.message);
      }
    } catch (error) {
      console.error("Error creating order ID:", error);
      // Handle error here, e.g., show error message to the user
    }
  };

  const maticPayment = async () => {
    setStatus("loading");
    try {
      console.log("the amount is: ", amount);
      await createOrderId();
      if (!orderId) {
        console.log("Unable to create orderId");
        return;
      }
      alert(`Your orderId is ${orderId}`);
      const parsedValue = ethers.utils.parseEther(amount.toString());

      const trx = await mQartContractWithSigner.depositNative(orderId, {
        value: parsedValue,
        // gasPrice: gasPrice,
        gasLimit: 3000000000,
      });

      await trx.wait(); // Wait for the transaction to be mined
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
        onClick={() => maticPayment()}
        className="bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-colors duration-500 text-emerald-500 py-3 px-5 rounded-md w-full"
      >
        {status !== "loading" ? "Pay with Matic" : "Loading..."}
      </button>
    </article>
  );
}

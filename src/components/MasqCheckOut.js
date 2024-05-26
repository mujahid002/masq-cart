import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  tMasqContractWithSigner,
  mQartContractWithSigner,
  tMASQ_TOKEN_ADDRESS,
} from "../constants/index";
import { MQART_ADDRESS, tMasqContract } from "../constants/index";
import { useGlobalContext } from "../context/Store";

export default function MasqCheckOut({ amount }) {
  const [status, setStatus] = useState("idle");
  const { userAddress } = useGlobalContext();

  const createOrderId = async () => {
    try {
      const data = {
        userAddress: userAddress,
        orderAmount: amount,
        orderNature: false,
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
        const orderId = res.data.orderId;
        console.log("The order id is", orderId);
        return orderId;
      } else {
        console.error("Failed to create orderId:", res.data.message);
      }
    } catch (error) {
      console.error("Error creating order ID:", error);
    }
  };

  const checkApproved = async (address, contractAddress, amount) => {
    try {
      const checkApprovedBalance = await tMasqContract.allowance(
        address,
        contractAddress
      );
      const approvedBalance = checkApprovedBalance.value.toString();
      if (approvedBalance !== amount) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking approval:", error);
      return false;
    }
  };

  const masqApproval = async (address) => {
    try {
      if (await checkApproved(address, tMASQ_TOKEN_ADDRESS, amount)) {
        return true;
      }
      alert(`Need to approve ${amount} of Masq token`);
      const parsedValue = ethers.utils.parseEther(amount.toString());
      const trx = await tMasqContract.approve(MQART_ADDRESS, parsedValue);
      await trx;
      return true;
    } catch (error) {
      console.error("Approval failed", error);
      return false;
    }
  };

  const masqPayment = async () => {
    setStatus("loading");
    try {
      const check = await masqApproval(userAddress);
      if (!check) {
        throw new Error("Confirm your token approval");
      }
      console.log("The amount is: ", amount);
      let orderId = await createOrderId();
      if (!orderId) {
        console.log("Unable to create orderId");
        setStatus("error");
        return;
      }
      alert(`Your orderId is ${orderId}`);
      alert(`Total Amount is ${ethers.utils.formatEther(amount.toString())}`);
      const parsedValue = ethers.utils.formatEther(amount.toString());

      const trx = await mQartContractWithSigner.depositNative(orderId, {
        value: parsedValue,
        gasLimit: 3000000,
      });

      await trx.wait();
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
        onClick={masqPayment}
        className="bg-emerald-50 hover:bg-emerald-500 hover:text-white transition-colors duration-500 text-emerald-500 py-3 px-5 rounded-md w-full"
        disabled={status === "loading"}
      >
        {status !== "loading" ? "Pay with Masq" : "Loading..."}
      </button>
    </article>
  );
}

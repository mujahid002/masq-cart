import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import {
  mQartContract,
  tMasqContractWithSigner,
  mQartContractWithSigner,
  tMASQ_TOKEN_ADDRESS,
} from "../constants/index";
import { MQART_ADDRESS, tMasqContract } from "../constants/index";
import { useGlobalContext } from "../context/Store";

export default function MasqCheckOut({ amount }) {
  const [status, setStatus] = useState("idle");
  const { userAddress, tokenBalance } = useGlobalContext();

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

  const checkApproved = async (address, contractAddress) => {
    try {
      const checkApprovedBalance = await tMasqContract.allowance(
        address,
        contractAddress
      );
      const approvedBalance = checkApprovedBalance.toString();
      console.log("Approved Balance is", approvedBalance);
      return checkApprovedBalance;
    } catch (error) {
      console.error("Error checking approval:", error);
      return ethers.BigNumber.from(0);
    }
  };

  const masqApproval = async (address) => {
    try {
      const parsedValue = ethers.utils.parseEther(amount.toString());
      const approvedBalance = await checkApproved(address, MQART_ADDRESS);

      console.log(parsedValue.toString(), approvedBalance.toString(), "check");

      if (approvedBalance.gte(parsedValue)) {
        alert(`You have enough approved balance, please proceed with payment!`);
        return true;
      }

      const requiredApproval = parsedValue.sub(approvedBalance);
      alert(
        `Need to approve ${ethers.utils.formatEther(
          requiredApproval
        )} more of Masq token`
      );

      const trx = await tMasqContract.approve(MQART_ADDRESS, requiredApproval);
      await trx.wait();
      console.log("the trx for approval is", trx);
      return true;
    } catch (error) {
      console.error("Approval failed", error);
      return false;
    }
  };

  const masqPayment = async () => {
    setStatus("loading");
    try {
      if (tokenBalance == 0) {
        alert(`Your MASQ balance is ${tokenBalance}, get tokens first!`);
        return;
      }
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
      const parsedValue = ethers.utils.parseEther(amount.toString());

      const trx = await mQartContract.depositToken(orderId, parsedValue, {
        gasLimit: 1000000,
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

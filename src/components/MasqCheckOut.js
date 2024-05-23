import { useState } from "react";
import { mQartContractWithSigner } from "../constants/index";
import { ethers } from "ethers"; // Ensure ethers is imported

export default function MasqCheckOut({ amount }) {
  const [status, setStatus] = useState("idle");

  const masqPayment = async () => {
    setStatus("loading");
    try {
      const parsedValue = ethers.utils.parseEther(amount.toString());
      // Estimate gas limit for the transaction
      const gasLimit = await mQartContractWithSigner.estimateGas.depositNative({
        value: parsedValue,
      });

      const trx = await mQartContractWithSigner.depositNative({
        value: parsedValue,
        // gasPrice: gasPrice,
        gasLimit: gasLimit,
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

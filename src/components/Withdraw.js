import { mQartContract } from "../constants";
import { useGlobalContext } from "../context/Store";
import { useState } from "react";

export function WithdrawMatic() {
  const withdrawTotalMatic = async () => {
    try {
      const trx = await mQartContract.withdraw({
        gasLimit: 300000,
      });
      await trx;
      if (!trx.hash) {
        throw new error("Cannot able to call withdraw in mQartContract", error);
      }
    } catch (error) {
      console.error("Cannot able to call withdrawTotalMatic function", error);
    }
  };

  return (
    <div className="flex justify-around items-center">
      <button
        onClick={() => withdrawTotalMatic()}
        className="bg-purple-50 hover:bg-purple-500 hover:text-white transition-colors duration-500 text-purple-500 rounded-md px-5 py-2"
      >
        Withdraw Matic
      </button>
    </div>
  );
}
export function WithdrawMasq() {
  const withdrawTotalMasq = async () => {
    try {
      const trx = await mQartContract.withdrawTokens({
        gasLimit: 300000,
      });
      await trx;
      if (!trx.hash) {
        throw new error(
          "Cannot able to call withdrawTokens in mQartContract",
          error
        );
      }
    } catch (error) {
      console.error("Cannot able to call withdrawTotalMasq function", error);
    }
  };

  return (
    <div className="flex justify-around items-center">
      <button
        onClick={() => withdrawTotalMasq()}
        className="bg-purple-50 hover:bg-purple-500 hover:text-white transition-colors duration-500 text-purple-500 rounded-md px-5 py-2"
      >
        Withdraw Masq
      </button>
    </div>
  );
}

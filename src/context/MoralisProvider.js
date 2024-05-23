// src/context/MoralisProvider.js

import React, { createContext, useContext, useEffect } from "react";
import Moralis from "moralis";

const MoralisContext = createContext();

export const MoralisProvider = ({ children }) => {
  useEffect(() => {
    const startMoralis = async () => {
      try {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        });
        console.log("Moralis started successfully");
      } catch (error) {
        console.error("Failed to start Moralis:", error);
      }
    };

    startMoralis();
  }, []);

  return (
    <MoralisContext.Provider value={{}}>{children}</MoralisContext.Provider>
  );
};

export const useMoralis = () => {
  return useContext(MoralisContext);
};

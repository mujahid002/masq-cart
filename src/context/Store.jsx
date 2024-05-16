"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Create the context
const GlobalContext = createContext({
  shouldDisplayCart: false,
  setShouldDisplayCart: () => {},
  cartCount: 0,
  setCartCount: () => {},
});

export const GlobalContextProvider = ({ children }) => {
  const [shouldDisplayCart, setShouldDisplayCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  return (
    <GlobalContext.Provider
      value={{
        shouldDisplayCart,
        setShouldDisplayCart,
        cartCount,
        setCartCount,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider"
    );
  }
  return context;
};

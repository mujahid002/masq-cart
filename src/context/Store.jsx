import { createContext, useContext, useState } from "react";

// Create the context
const GlobalContext = createContext({
  shouldDisplayCart: false,
  setShouldDisplayCart: () => {},
  cartCount: 0,
  setCartCount: () => {},
  cartItems: [],
  setCartItems: () => {},
});

export const GlobalContextProvider = ({ children }) => {
  const [shouldDisplayCart, setShouldDisplayCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  return (
    <GlobalContext.Provider
      value={{
        shouldDisplayCart,
        setShouldDisplayCart,
        cartCount,
        setCartCount,
        cartItems,
        setCartItems,
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

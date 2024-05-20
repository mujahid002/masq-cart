import { createContext, useContext, useState } from "react";

// Create the context
const GlobalContext = createContext({
  userAddress: "",
  setUserAddress: () => {},
  nativeBalance: "",
  setNativeBalance: () => {},
  tokenBalance: "",
  setTokenBalance: () => {},

  shouldDisplayCart: false,
  setShouldDisplayCart: () => {},
  cartCount: 0,
  setCartCount: () => {},
  cartItems: [],
  setCartItems: () => {},
  removeItemFromCart: () => {},
});

export const GlobalContextProvider = ({ children }) => {
  const [shouldDisplayCart, setShouldDisplayCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const removeItemFromCart = (itemId) => {
    setCartItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === itemId);
      if (itemToRemove) {
        setCartCount((prevCount) =>
          Math.max(prevCount - itemToRemove.quantity, 0)
        );
      }
      const updatedItems = prevItems.filter((item) => item.id !== itemId);
      if (updatedItems.length === 0) {
        setShouldDisplayCart(false);
      }
      return updatedItems;
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        shouldDisplayCart,
        setShouldDisplayCart,
        cartCount,
        setCartCount,
        cartItems,
        setCartItems,
        removeItemFromCart,
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

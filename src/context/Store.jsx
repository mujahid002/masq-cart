import { createContext, useContext, useState } from "react";

// Create the context
const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [userAddress, setUserAddress] = useState("");
  const [nativeBalance, setNativeBalance] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [shouldDisplayCart, setShouldDisplayCart] = useState(false);
  const [orderId, setOrderId] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [maticPrice, setMaticPrice] = useState(0);
  const [masqPrice, setMasqPrice] = useState(0);
  const [maticDeposits, setMaticDeposits] = useState(0);
  const [masqDeposits, setMasqDeposits] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const addItemToCart = (product, quantity) => {
    const { id, name, price, emoji, discount } = product;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === id);
      if (existingItemIndex !== -1) {
        // Update the quantity of the existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        const newItem = {
          id,
          name,
          price,
          emoji,
          discount,
          quantity,
        };
        return [...prevItems, newItem];
      }
    });

    setCartCount((prevCount) => prevCount + quantity);
    setShouldDisplayCart(true);
  };

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
        userAddress,
        setUserAddress,
        nativeBalance,
        setNativeBalance,
        tokenBalance,
        setTokenBalance,
        shouldDisplayCart,
        setShouldDisplayCart,
        orderId,
        setOrderId,
        maticPrice,
        setMaticPrice,
        masqPrice,
        setMasqPrice,
        maticDeposits,
        setMaticDeposits,
        masqDeposits,
        setMasqDeposits,
        cartCount,
        setCartCount,
        cartItems,
        setCartItems,
        addItemToCart,
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

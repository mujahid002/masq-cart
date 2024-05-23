// src/data/products.js

import Moralis from "moralis";

export async function getPrices() {
  try {
    // Fetch MATIC price
    const maticDataResponse = await fetch(
      `https://api.polygonscan.com/api?module=stats&action=maticprice&apikey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`
    );
    if (!maticDataResponse.ok) {
      throw new Error("Failed to fetch MATIC price");
    }
    const maticData = await maticDataResponse.json();
    const maticPrice = parseFloat(maticData.result.maticusd);
    if (isNaN(maticPrice)) {
      throw new Error("Invalid MATIC price data");
    }

    // Fetch MASQ price
    const response = await Moralis.EvmApi.token.getTokenPrice({
      chain: "0x89",
      address: "0xEe9A352F6aAc4aF1A5B9f467F6a93E0ffBe9Dd35",
    });

    const masqPrice = parseFloat(response.raw.usdPrice);
    if (isNaN(masqPrice)) {
      throw new Error("Invalid MASQ price data");
    }

    return {
      maticPrice: maticPrice.toFixed(4),
      masqPrice: masqPrice.toFixed(4),
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    return { error: error.message };
  }
}

export const products = [
  {
    id: 1,
    name: "Banana",
    price: "0.1",
    emoji: "🍌",
    discount: "10",
  },
  {
    id: 2,
    name: "Apple",
    price: "0.4",
    emoji: "🍎",
    discount: "20",
  },
  {
    id: 3,
    name: "Watermelon",
    price: "0.5",
    emoji: "🍉",
    discount: "20",
  },

  {
    id: 4,
    name: "Pineapple",
    price: "0.6",
    emoji: "🍍",
    discount: "30",
  },
];

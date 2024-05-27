const express = require("express");
const { provider, MQartContract, MQART_ABI } = require("./constants/index");
const cors = require("cors");
const bodyParser = require("body-parser");
const ConnectMongo = require("./database/ConnectMongo.js");
const { storeOrder } = require("./database/functions/Admin");
const ethers = require("ethers");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function getEventDataFromTransaction(transactionHash) {
  try {
    const receipt = await provider.getTransactionReceipt(transactionHash);
    if (!receipt) {
      throw new Error("Transaction receipt not found");
    }
    const logs = receipt.logs;
    let eventData = [];
    logs.forEach((log) => {
      if (
        log.topics[0] ===
        MQartContract.interface.getEventTopic("OrderIdCreated")
      ) {
        // Decode the event data
        const decodedData = MQartContract.interface.decodeEventLog(
          "OrderIdCreated",
          log.data,
          log.topics
        );
        console.log("Decoded event data:", decodedData);
        eventData.push(ethers.BigNumber.from(decodedData.orderId).toString());
        eventData.push(
          ethers.BigNumber.from(decodedData.orderAmount).toString()
        );
        eventData.push(decodedData.orderNature);
      }
    });
    console.log(eventData);
    return eventData;
  } catch (error) {
    console.error("Error fetching events:", error);
    return null;
  }
}

app.get("/", (req, res) => {
  res.send("Hello I am running on 8888!");
});

app.post("/create-orderId", async (req, res) => {
  try {
    const { userAddress, orderAmount, orderNature } = req.body;
    if (orderAmount <= 0) {
      res.status(500).json({
        success: false,
        message: "Check orderAmount and inputs",
      });
      return;
    }

    // Parsing the order amount to Ether
    const parsedValue = ethers.utils.parseEther(orderAmount.toString());

    // Calling the contract function
    const orderIdTx = await MQartContract.createOrderId(
      parsedValue,
      orderNature,
      {
        gasLimit: 500000,
      }
    );

    // Wait for the transaction to be mined
    const orderIdReceipt = await orderIdTx.wait();
    if (!orderIdReceipt) {
      throw new Error("Transaction not mined");
    }

    // Extract transaction hash from receipt
    const transactionHash = orderIdReceipt.transactionHash;
    console.log("The Hash is", transactionHash);

    // Fetch event data from the mined transaction
    const eventData = await getEventDataFromTransaction(transactionHash);
    if (!eventData || eventData.length === 0) {
      throw new Error("Event data not found");
    }

    // Return the transaction details or a success message
    res.status(200).json({
      success: true,
      orderId: eventData[0],
      transactionHash: transactionHash,
    });

    // Store order data
    const data = {
      userAddress: userAddress,
      orderId: eventData[0],
      orderIsNative: eventData[2],
      orderAmount: orderAmount,
    };
    await storeOrder(data);
  } catch (error) {
    // Handle errors and return a relevant response
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create order ID",
      error: error.message,
    });
  }
});

// Start the server and listen on port 8888
app.listen(8888, () => {
  console.log("App listening on port 8888");
  // ConnectMongo();
});

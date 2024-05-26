const express = require("express");
const { MQartContract } = require("./constants/index");
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
    const parsedValue = ethers.parseEther(orderAmount.toString());

    // Calling the contract function
    const orderId = await MQartContract.createOrderId(
      parsedValue,
      orderNature,
      {
        gasLimit: 500000,
      }
    );
    await orderId.wait();

    // Return the transaction details or a success message
    res.status(200).json({
      success: true,
      orderId: orderId.value.toString(),
    });

    const data = {
      userAddress: userAddress,
      orderId: orderId.value.toString(),
      orderIsNative: orderNature,
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

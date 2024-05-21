const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const ConnectMongo = require("./database/ConnectMongo.js");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello I am running on 8888!");
});

// Start the server and listen on port 8888
app.listen(8888, () => {
  console.log("App listening on port 8888");
  ConnectMongo();
});

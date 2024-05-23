const ConnectMongo = require("../ConnectMongo");

const getOrder = async () => {
  const client = await ConnectMongo();
  const db = client.db("hooman");
  const collection = db.collection("orders");

  // Use toArray() to convert the cursor to an array of documents
  const orders = await collection.find().toArray();

  console.log(orders);

  // Close the MongoDB client after the operation is complete
  await client.close();

  return orders;
};

const storeOrder = async (data) => {
  const client = await ConnectMongo();
  const db = client.db("hooman");
  const collection = db.collection("orders");

  const storeData = await collection.insertOne(data);
  console.log("Admin orders is stored to hooman db", storeData);

  // Close the MongoDB client after the operation is complete
  await client.close();
};

module.exports = { getOrder, storeOrder };

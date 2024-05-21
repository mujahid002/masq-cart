import ConnectMongo from "../ConnectMongo";

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

const storeOrder = async (address) => {
  const client = await ConnectMongo();
  const db = client.db("hooman");
  const collection = db.collection("orders");

  const storeAddress = collection.insertOne(address);
  console.log("Admin orders is stored to hooman db", storeAddress);

  // Close the MongoDB client after the operation is complete
  await client.close();
};

export default { getOrder, storeOrder };

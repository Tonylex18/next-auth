//mongodb+srv://anthonyagada2000:<password>@cluster0.qsx9qrx.mongodb.net/?retryWrites=true&w=majority

import { MongoClient } from "mongodb";

export async function connectToDatabase() {
  const uri = "mongodb+srv://anthonyagada2000:UEiWqDKAC0MOhUr4@cluster0.qsx9qrx.mongodb.net/next-demo?retryWrites=true&w=majority";

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to the database");
    return client;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}


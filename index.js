const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectID } = require("bson");
const { json } = require("express");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  const productsCollection = client.db("outshade").collection("products");
  const categoryCollection = client.db("outshade").collection("categories");

  try {
    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/addCategory", async (req, res) => {
      const name = req.body.name;
      const filter = {
        name: name,
      };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: name,
        },
      };
      const result = await categoryCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/categories", async (req, res) => {
      const name = req.body.name;
      const catQuery = { name: name };
      const productQuery = { category: name };
      const catResult = await categoryCollection.deleteOne(catQuery);
      const proResutl = await productsCollection.deleteMany(productQuery);
      res.send(catResult);
    });

    app.post("/addProducts", async (req, res) => {
      const product = req.body;
      const category = req.body.category;
      const catName = {
        name: category,
      };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: category,
        },
      };
      const result = await productsCollection.insertOne(product);
      const cateResult = await categoryCollection.updateOne(
        catName,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/productsByCategory/:id", async (req, res) => {
      const category = req.params.id;
      const query = { category: category };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/productDelete", async (req, res) => {
      const id = req.body.productId;
      const query = { _id: ObjectID(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, console.log(`server is running on ${port}`));

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
//middleware
app.use(express.json());
app.use(cors());
//mongodb code here
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASSWORD}@cluster0.inzz8jh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const dbConnect = async () => {
  try {
    client.connect();
    console.log("Database Connected Successfully✅");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();
const UserCollection = client.db("PhototuneDB").collection("users");
const PhotographyCollection = client
  .db("PhototuneDB")
  .collection("photography");
// admin related api
//post users infomation
app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await UserCollection.findOne(query);
  if (existingUser) {
    return [
      res.send({ message: "user already exists" }),
    ];
  }
  const result = await UserCollection.insertOne(user);
  res.send(result);
});
//get users information
app.get("/users", async (req, res) => {
  const result = await UserCollection.find().toArray();
  res.send(result);
});
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await UserCollection.findOne(query);
  res.send(result);
})
app.get("/isAdmin/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await UserCollection.findOne(query);
  const result = { admin:user?.role === "admin" };
  res.send(result);
});
// single users delete form database 
app.delete("/deleteSingleUser/:id", async (req, res) => {
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result = await UserCollection.deleteOne(query);
  res.send(result)
})
//get all photgraphy on the database
app.get("/getAllPhotography", async (req, res) => {
  const result = await PhotographyCollection.find().toArray();
  res.send(result);
});
app.get('/singlePhotography/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id:new ObjectId(id)};
  const result =  await PhotographyCollection.findOne(query);
  res.send(result)
})
//update photgraphy on the database
app.put("/approved/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      status: "approved",
    },
  };
  const result = await PhotographyCollection.updateOne(query, updateDoc, options);
  res.send(result);
});
//delete single photgraphy on the database
app.delete("/deleteSinglePhotography/:id", async (req,res)=>{
  const id = req.params.id;
  const query = {_id:new ObjectId(id)}
  const result = await PhotographyCollection.deleteOne(query);
  res.send(result)
})
//get ishost user
app.get("/isHost/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await UserCollection.findOne(query);
  const result = { host: user?.role === "host" };
  res.send(result);
});
// host related api
//Upload or Post photography
app.post("/hostPhotography", async (req, res) => {
  const PhotographyInfo = req.body;
  const result = await PhotographyCollection.insertOne(PhotographyInfo);
  res.send(result);
});
//get photography information;
app.get("/hostPhotography/:email", async (req, res) => {
  const email = req.params.email;
  const query = { authorEmail: email };
  const result = await PhotographyCollection.find(query).toArray();
  res.send(result);
});
//user related api
//host btn clcik user role set host
app.put("/setHost/:email", async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      role: "host",
    },
  };
  const result = await UserCollection.updateOne(query, updateDoc, options);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

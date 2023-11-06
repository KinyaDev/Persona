const { MongoClient } = require("mongodb");

let client = new MongoClient(process.env.MONGO_STRING, { retryWrites: true });
client
  .connect()
  .then(() => {
    console.log(`Connected to the database`);
  })
  .catch((err) => {
    throw err;
  });

let db = client.db("persona");
let characters = db.collection("characters");
let users = db.collection("users");

module.exports = { characters, users };

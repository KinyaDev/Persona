const { Router } = require("express");
const auth = require("../auth");
const { characters, users } = require("../db");
const { ObjectId } = require("mongodb");

let route = Router();

// Getting all existing characters

route.get("/", async (req, res) => {
  let charas = await characters.find().toArray();
  let parsedCharas = [];

  for (let chara of charas) {
    let user = await users.findOne({ token: chara.user_token });

    parsedCharas.push({
      _id: chara._id,
      name: chara.name,
      loreData: chara.loreData,
      user_id: user._id.toString(),
      created_timestamp: chara.created_timestamp,
      edited_timestamp: chara.edited_timestamp,
    });
  }

  res.json(parsedCharas);
});

// Getting characters of logged profile

route.get("/me", auth, async (req, res) => {
  let charas = await characters
    .find({ user_token: req.cookies["token"] })
    .toArray();
  let parsedCharas = [];

  for (let { name, loreData, created_timestamp, edited_timestamp } of charas) {
    parsedCharas.push({ name, loreData, created_timestamp, edited_timestamp });
  }

  res.json(parsedCharas);
});

// Getting a specific character by its ID or by its name

route.get("/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    let _id = new ObjectId(req.params.id);
    let character = await characters.findOne({ _id });

    if (!character)
      return res.status(404).json({ message: "invalid character id" });

    let user = await users.findOne({ token: character.user_token });

    res.json({
      name: character.name,
      loreData: character.loreData,
      user_id: user._id.toString(),
      created_timestamp: character.created_timestamp,
      edited_timestamp: character.edited_timestamp,
    });
  } else {
    let character = await characters.findOne({ name: req.params.id });
    if (!character)
      return res.status(404).json({ message: "can't find character" });

    let user = await users.findOne({ token: character.user_token });

    res.json({
      name: character.name,
      loreData: character.loreData,
      user_id: user._id.toString(),
      created_timestamp: character.created_timestamp,
      edited_timestamp: character.edited_timestamp,
    });
  }
});

// Creating a character with logged user

route.post("/", auth, async (req, res) => {
  let { name, loreData } = req.body;

  if (!name)
    return res.status(500).json({ message: "character must have a nale" });

  if (name.length < 4)
    return res
      .status(500)
      .json({ message: "character name must have more than 4 caracters" });

  let exists = await characters.findOne({ name });
  if (!exists) {
    let result = await characters.insertOne({
      name,
      created_timestamp: Date.now(),
      user_token: req.cookies["token"],
      loreData,
      edited_timestamp: Date.now(),
    });

    res.json({ message: "ok", _id: result.insertedId.toString(), name });
  } else res.status(500).json({ message: "already exist" });
});

// Editing a character, can be another one's character, but we have to get logged to edit
route.put("/", auth, async (req, res) => {
  let _id = new ObjectId(req.body._id);
  let { loreData } = req.body;

  let character = await characters.findOne({ _id });
  if (!character) {
    res.status(404).json({ message: "invalid character id" });
  } else {
    characters.updateOne(
      { _id },
      { $set: { loreData, edited_timestamp: Date.now() } }
    );
  }
});

route.delete("/", auth, async (req, res) => {
  characters.deleteOne({ userToken: req.cookies.token });
  res.json({ message: "ok" });
});

module.exports = route;

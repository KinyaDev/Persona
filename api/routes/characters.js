const { Router } = require("express");
const auth = require("../auth");
const { characters } = require("../db");
const { ObjectId } = require("mongodb");

let route = Router();

route.get("/", async (req, res) => {
  let charas = await characters.find().toArray();
  let parsedCharas = [];

  for (let chara of charas) {
    parsedCharas.push({
      _id: chara._id,
      name: chara.name,
      content: chara.content,
    });
  }

  res.json(parsedCharas);
});

route.get("/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    let _id = new ObjectId(req.params.id);
    let character = await characters.findOne({ _id });

    if (!character)
      return res.status(404).json({ message: "invalid character id" });
    res.json({
      name: character.name,
      loreData: character.loreData,
    });
  } else {
    let character = await characters.findOne({ name: req.params.id });
    if (!character)
      return res.status(404).json({ message: "can't find character" });

    res.json({
      name: character.name,
      loreData: character.loreData,
    });
  }
});

route.post("/", auth, async (req, res) => {
  let { name, user_token, loreData } = req.body;

  let exists = await characters.findOne({ name });
  if (!exists) {
    let result = await characters.insertOne({ name, user_token, loreData });
    res.json({ message: "ok", _id: result.insertedId.toString(), name });
  } else res.status(500).json({ message: "already exist" });
});

route.put("/", auth, async (req, res) => {
  let _id = new ObjectId(req.body._id);
  let { loreData } = req.body;

  let character = await characters.findOne({ _id });
  if (!character) {
    res.status(404).json({ message: "invalid character id" });
  } else {
    characters.updateOne({ _id }, { loreData });
  }
});

module.exports = route;

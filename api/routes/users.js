const { Router } = require("express");
const auth = require("../auth");
const { users } = require("../db");
const { ObjectId } = require("mongodb");
const notAuth = require("../notAuth");
const multer = require("multer");
const multerAvatar = multer({ dest: `${process.cwd()}/avatars` });
const fs = require("fs");

function createToken() {
  let chars = "abcdefghijklmopqrtuvwxyz1234567890-.";
  let res = "";

  for (let i = 0; i < 20; i++) {
    res += chars[Math.floor(Math.random())];
  }

  return res;
}

let route = Router();

route.get("/", async (req, res) => {
  let array = await users.find().toArray();
  let parsedUsers = [];

  for (let user of array) {
    parsedUsers.push({
      _id: user._id,
      name: user.name,
      avatar_url: user.avatar_url,
    });
  }

  res.json(parsedUsers);
});

route.get("/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    let _id = new ObjectId(req.params.id);

    let user = await users.findOne({ _id });
    if (!user) return res.status(404).json({ message: "invalid user id" });

    res.json({
      name: user.name,
      avatar_url: user.avatar_url,
    });
  } else {
    let user = await users.findOne({ name: req.params.id });
    if (!user) return res.status(404).json({ message: "can't find user" });

    res.json({
      name: user.name,
      avatar_url: user.avatar_url,
    });
  }
});

route.put(
  "/avatar",
  multerAvatar.single("upload_avatar"),
  auth,
  async (req, res) => {
    let user = await users.findOne({ token: req.cookies["token"] });
    let oldAvatarURL = user.avatar_url;

    let avatar_url = req.file.path;

    if (
      !(req.file.mimetype === "image/png" || req.file.mimetype === "image/jpeg")
    )
      return res
        .status(500)
        .json({ message: "avatar must be in the PNG or JPEG format" });

    let newAvatar_url = avatar_url.replace(
      req.file.filename,
      user._id.toString()
    );

    fs.renameSync(avatar_url, newAvatar_url);

    users.updateOne({ _id: user._id }, { avatar_url: newAvatar_url });

    res.json({ message: "ok", old: oldAvatarURL, new: newAvatar_url });
  }
);

route.post("/", notAuth, async (req, res) => {
  let { username, password, avatar_url } = req.body;

  let exists = await users.findOne({ username });
  if (!exists) {
    let token = createToken();
    let result = await users.insertOne({
      username,
      password,
      avatar_url,
      token,
    });
    res.json({ message: "ok", _id: result.insertedId.toString(), token });
  } else res.status(500).json({ message: "already exist" });
});

route.put("/", auth, async (req, res) => {
  let { username, email } = req.body;

  let user = await users.findOne({ token: req.cookies.token });

  users.updateOne({ _id: user.id }, { username, email });
});

module.exports = route;

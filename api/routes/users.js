const { Router } = require("express");
const auth = require("../auth");
const { users } = require("../db");
const { ObjectId } = require("mongodb");
const notAuth = require("../notAuth");
const multer = require("multer");
const multerAvatar = multer({ dest: `${process.cwd()}/avatars` });
const fs = require("fs");
const bcrypt = require("bcrypt");

function createToken() {
  let chars = "abcdefghijklmopqrtuvwxyz1234567890-.";
  let res = "";

  for (let i = 0; i < 20; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }

  return res;
}

let route = Router();

// Register

route.post("/", notAuth, async (req, res) => {
  let { username, password } = req.body;

  if (!username || !password)
    return res
      .status(500)
      .json({ message: "please provide password and username" });

  if (username.length < 4)
    return res
      .status(500)
      .json({ message: "username name must have more than 4 caracters" });

  if (password.length < 8)
    return res
      .status(500)
      .json({ message: "password must have at least 8 caracters" });

  let exists = await users.findOne({ username });
  if (exists) return res.status(500).json({ message: "already exist" });

  let token = createToken();
  let result = await users.insertOne({
    username,
    password: bcrypt.hashSync(password, 10),
    login_timestamp: Date.now(),
    created_timestamp: Date.now(),
    token,
  });

  res.cookie("token", token);
  res.json({ message: "ok", _id: result.insertedId.toString(), token });
});

// Login

route.post("/login", notAuth, async (req, res) => {
  let { username, password } = req.body;

  let u = await users.findOne({ username });
  if (!u)
    return res.status(404).json({ message: "can't find user by username" });

  users.updateOne({ _id: u._id }, { $set: { login_timestamp: Date.now() } });

  if (bcrypt.compareSync(password, u.password)) {
    res.cookie("token", u.token);
    res.json({ message: "logged in", token: u.token });
  }
});

// Disconnect (remove token from cookies)

route.post("/disconnect", auth, async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "ok" });
});

// Getting all existing profiles

route.get("/", async (req, res) => {
  let array = await users.find().toArray();
  let parsedUsers = [];

  for (let user of array) {
    parsedUsers.push({
      _id: user._id,
      username: user.username,
      avatar_url: user.avatar_url,
      created_timestamp: user.created_timestamp,
      login_timestamp: user.login_timestamp,
    });
  }

  res.json(parsedUsers);
});

// Getting logged profile

route.get("/me", auth, async (req, res) => {
  let u = await users.findOne({ token: req.cookies["token"] });

  res.json({
    username: u.username,
    avatar_url: u.avatar_url,
    email: u.email,
    created_timestamp: u.created_timestamp,
    login_timestamp: u.login_timestamp,
  });
});

route.delete("/", auth, async (req, res) => {
  users.deleteOne({ token: req.cookies.token });
  res.clearCookie("token");
  res.json({ message: "ok" });
});

// Getting a Profile by ID or by name

route.get("/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    let _id = new ObjectId(req.params.id);

    let user = await users.findOne({ _id });
    if (!user) return res.status(404).json({ message: "invalid user id" });

    res.json({
      name: user.name,
      avatar_url: user.avatar_url,
      created_timestamp: user.created_timestamp,
      login_timestamp: user.login_timestamp,
    });
  } else {
    let user = await users.findOne({ name: req.params.id });
    if (!user) return res.status(404).json({ message: "can't find user" });

    res.json({
      name: user.name,
      avatar_url: user.avatar_url,
      created_timestamp: user.created_timestamp,
      login_timestamp: user.login_timestamp,
    });
  }
});

// Updating avatar

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

    if (req.file.size > 5 * 10 ** 6)
      return res
        .status(500)
        .json({ message: "avatar weight must be inferior to 5MB" });

    let newAvatar_url = avatar_url.replace(
      req.file.filename,
      user._id.toString()
    );

    fs.renameSync(avatar_url, newAvatar_url);

    users.updateOne(
      { _id: user._id },
      { $set: { avatar_url: newAvatar_url, edited_timestamp: Date.now() } }
    );

    res.json({ message: "ok", old: oldAvatarURL, new: newAvatar_url });
  }
);

// Updating Profile

route.put("/", auth, async (req, res) => {
  let { username, email } = req.body;

  if (username.length < 4)
    return res
      .status(500)
      .json({ message: "username name must have more than 4 caracters" });

  let user = await users.findOne({ token: req.cookies.token });

  users.updateOne(
    { _id: user.id },
    { $set: { username, email, edited_timestamp: Date.now() } }
  );
});

module.exports = route;

const { Router } = require("express");
const { characters, users } = require("./db");
const cookieParser = require("cookie-parser");

let route = Router();

route.use(cookieParser());

route.use(async (req, res, next) => {
  let token = req.cookies["token"];
  if (!token) return res.redirect("/");

  let user = await users.findOne({ token });
  if (!user) {
    res.cookie("token", undefined);
    res.redirect("/");

    return;
  }

  next();
});

module.exports = route;

const { Router } = require("express");
const { characters, users } = require("./db");
const cookieParser = require("cookie-parser");

let route = Router();

route.use(cookieParser());

route.use(async (req, res, next) => {
  let token = req.cookies["token"];
  if (!token) return next();
  else res.status(500).json({ message: "already logged in" });
});

module.exports = route;

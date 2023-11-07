const { Router } = require("express");
const { characters, users } = require("./db");
const cookieParser = require("cookie-parser");

let route = Router();

route.use(cookieParser());

route.use(async (req, res, next) => {
  let token = req.cookies["token"];
  if (!token) return next();
  else {
    let u = await users.findOne({ token });

    if (u) return res.status(500).json({ message: "already logged in" });
    res.clearCookie("token");
    res.redirect(req.originalUrl);
  }
});

module.exports = route;

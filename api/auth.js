const { Router } = require("express");
const { characters, users } = require("./db");
const cookieParser = require("cookie-parser");

let route = Router();

route.use(cookieParser());

route.use(async (req, res, next) => {
  let token = req.cookies["token"];
  if (token === undefined)
    return res.status(403).json({
      message: "forbidden, you have to be logged in to access this ressource",
    });

  let user = await users.findOne({ token });
  if (!user) {
    res.clearCookie("token");
    return res.status(403).json({
      message: "forbidden, you have to be logged in to access this ressource",
    });
  }

  next();
});

module.exports = route;

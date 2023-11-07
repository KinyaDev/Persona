const { Router } = require("express");
const { users } = require("./api/db");

let route = Router();

route.use(async (req, res, next) => {
  let user = new Object(req.cookies).hasOwnProperty("token")
    ? await users.findOne({ token: req.cookies["token"] })
    : undefined;
  var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  let name = user
    ? `${user.name} / ${user._id.toString()} (${ip})`
    : `anonymous (${ip})`;

  console.log(`${name} accessed ${req.originalUrl} (${req.method})`);

  next();
});

module.exports = route;

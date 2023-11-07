const e = require("express");
const { Router } = require("express");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const route = Router();

route.use(e.json());
route.use(e.urlencoded({ extended: true }));
route.use(cookieParser());

route.use("/characters", require("./routes/characters"));
route.use("/users", require("./routes/users"));

// API tests (by postman)

// Ping + Infos
route.get("/", (req, res) => {
  res.json({
    data: req.body,
    headers: req.headers,
    url: req.url,
  });
});

module.exports = route;

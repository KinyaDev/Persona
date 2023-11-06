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

route.use("/avatars", e.static(`${__dirname}/avatars`));

module.exports = route;

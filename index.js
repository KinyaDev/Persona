const express = require("express");
const app = express();

require("dotenv").config();

app.set("view engine", "ejs");
app.set("port", 1444);

app.use("/assets", express.static(`${__dirname}/assets`));
app.use("/avatars", express.static(`${__dirname}/avatars`));

app.use(require("./logger"));

let apiRoot =
  process.env.ENV === "prod"
    ? "https://api.persona.com"
    : "http://localhost:1444/api";

app.use("/api", require("./api/index"));

app.get("/:name", (req, res) => {
  res.render("pages/character", {
    apiRoot,
    characterName: req.params.name,
    editing: false,
  });
});

app.get("/", (req, res) => {
  res.render("pages/index", { apiRoot });
});

app.get("/:name/edit", (req, res) => {
  res.render("pages/character", {
    apiRoot,
    characterName: req.params.name,
    editing: true,
  });
});

app.listen(app.get("port"), () => {
  console.log(`Web app listening on *:${app.get("port")}`);
});

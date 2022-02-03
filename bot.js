const mongoose = require("mongoose");
const { WOLFBot } = require("wolf.js");
const messageHandler = require("./emoji/solver");

const api = new WOLFBot();
require("dotenv").config();

mongoose.connect("mongodb://localhost/emojitest", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.Promise = global.Promise;
const db = mongoose.connection;

module.exports = { api };

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("[*] Database is a live!");
});

api.on("ready", async () => console.log(`[*] - ${api.config.keyword} start.`));
api.on("groupMessage", async (message) => {
  await messageHandler(message, api);
});

api.login(process.env.EMAIL, process.env.PASSWORD);

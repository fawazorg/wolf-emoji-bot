const schedule = require("node-schedule");
const mongoose = require("mongoose");
const { WOLFBot } = require("wolf.js");
const messageHandler = require("./emoji/solver");
const { leaveInactiveGroups } = require("./emoji/jobs/group");
const { setLastActive, deleteGroup } = require("./emoji/active");
const api = new WOLFBot();
require("dotenv").config();

mongoose.connect(
  `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@127.0.0.1:27020/${process.env.MONGO_DB_NAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.Promise = global.Promise;
const db = mongoose.connection;

module.exports = { api };

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("[*] Database is a live!");
});

api.on("ready", async () => {
  console.log(`[*] - ${api.config.keyword} start.`);
  schedule.scheduleJob("0 * * * *", async () => await leaveInactiveGroups(api, 5));
});

api.on("groupMessage", async (message) => {
  await messageHandler(message, api);
});

api.on("joinedGroup", async (group) => {
  await setLastActive(group.id);
});

api.on("leftGroup", async (group) => {
  await deleteGroup(group.id);
});
api.login(process.env.EMAIL, process.env.PASSWORD);

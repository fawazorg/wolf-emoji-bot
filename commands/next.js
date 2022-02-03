const { Command } = require("wolf.js");
const { api } = require("../bot");
const { group } = require("../emoji/cache");
const { createGame } = require("../emoji");

const COMMAND_TRIGER = `${api.config.keyword}_command_next`;

Next = async (api, command) => {
  await createGame(command, api, true);
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => Next(api, command),
});

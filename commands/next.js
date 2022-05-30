const { Command } = require("wolf.js");
const { api } = require("../bot");
const { createGame } = require("../emoji");

const COMMAND_TRIGGER = `${api.config.keyword}_command_next`;

Next = async (api, command) => {
  await createGame(command, api, true);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => Next(api, command),
});

const { Command } = require("wolf.js");
const { api } = require("../bot");
const { group } = require("../emoji/cache");
const { createGame } = require("../emoji");

const COMMAND_TRIGER = `${api.config.keyword}_command_default`;

Default = async (api, command) => {
  return await createGame(command, api);
};

module.exports = new Command(COMMAND_TRIGER, {
  both: (command) => Default(api, command),
});

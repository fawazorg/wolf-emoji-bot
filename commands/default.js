const { Command } = require("wolf.js");
const { api } = require("../bot");
const { createGame } = require("../emoji");

const COMMAND_TRIGGER = `${api.config.keyword}_command_default`;

Default = async (api, command) => {
  if (!command.isGroup) {
    return;
  }
  return await createGame(command, api);
};

module.exports = new Command(COMMAND_TRIGGER, {
  both: (command) => Default(api, command),
});

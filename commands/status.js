const { Command } = require("wolf.js");
const { api } = require("../bot");
const { AutoStatus } = require("../emoji");

const COMMAND_TRIGGER = `${api.config.keyword}_command_status`;

AutoStatusCommand = async (api, command) => {
  await AutoStatus(command, api);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => AutoStatusCommand(api, command),
});

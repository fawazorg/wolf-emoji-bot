const { Command } = require("wolf.js");
const { api } = require("../bot");
const { AutoStatus } = require("../emoji");

const COMMAND_TRIGER = `${api.config.keyword}_command_status`;

AutoStatusCommand = async (api, command) => {
  await AutoStatus(command, api);
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => AutoStatusCommand(api, command),
});

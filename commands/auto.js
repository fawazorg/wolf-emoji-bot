const { Command } = require("wolf.js");
const { api } = require("../bot");
const { toggleAuto } = require("../emoji");

const COMMAND_TRIGGER = `${api.config.keyword}_command_auto`;

Auto = async (api, command) => {
  await toggleAuto(command, api);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => Auto(api, command),
});

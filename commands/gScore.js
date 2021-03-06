const { Command } = require("wolf.js");
const { api } = require("../bot");
const { top10Player } = require("../emoji");

const COMMAND_TRIGGER = `${api.config.keyword}_command_gscore`;

gScore = async (api, command) => {
  await top10Player(command, api);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => gScore(api, command),
});

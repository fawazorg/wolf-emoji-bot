const { Command } = require("wolf.js");
const { api } = require("../bot");
const { totalScore } = require("../emoji");

const COMMAND_TRIGGER = `${api.config.keyword}_command_score`;

Score = async (api, command) => {
  await totalScore(command, api);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => Score(api, command),
});

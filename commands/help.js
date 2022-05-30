const { Command } = require("wolf.js");
const { api } = require("../bot");

const COMMAND_TRIGGER = `${api.config.keyword}_command_help`;
const COMMAND_RESPONSE = `${api.config.keyword}_message_help`;

Help = async (api, command) => {
  await api
    .messaging()
    .sendMessage(
      command,
      api.phrase().getByLanguageAndName(command.language, COMMAND_RESPONSE).join("\n")
    );
};

module.exports = new Command(COMMAND_TRIGGER, {
  both: (command) => Help(api, command),
});

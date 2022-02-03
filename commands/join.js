const { Command } = require("wolf.js");
const { api } = require("../bot");

const COMMAND_TRIGER = `${api.config.keyword}_command_join`;

/**
 *
 * @param {import('wolf.js').WOLFBot} api
 * @param {import('wolf.js').CommandObject} command
 */
const Join = async (api, command) => {
  return;
  let [roomID, password] = command.argument.split(" ");
  let respoens = await api
    .group()
    .joinById(parseInt(api.utility().number().toEnglishNumbers(roomID)), password);
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => Join(api, command),
});

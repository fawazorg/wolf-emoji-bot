const { Command, Constants } = require("wolf.js");
const { api } = require("../../bot");

const COMMAND_TRIGER = `${api.config.keyword}_command_admin_help`;
const COMMAND_RESPONSE = `${api.config.keyword}_message_help_admin`;

HelpAdmin = async (api, command) => {
  const err = api.phrase().getByCommandAndName(command, "emoji_error_admin");
  if (command.targetGroupId !== parseInt(process.env.ROOM_ADMIN_ID)) {
    return await api.messaging().sendMessage(command, err[0]);
  }
  let okay = await api
    .utility()
    .group()
    .member()
    .hasCapability(
      command.targetGroupId,
      command.sourceSubscriberId,
      Constants.Capability.MOD,
      true
    );
  if (!okay) {
    return await api.messaging().sendMessage(command, err[1]);
  }
  await api
    .messaging()
    .sendMessage(
      command,
      api.phrase().getByLanguageAndName(command.language, COMMAND_RESPONSE).join("\n")
    );
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => HelpAdmin(api, command),
});

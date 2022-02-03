const { Command, Constants } = require("wolf.js");
const { api } = require("../../bot");
const { totalAnswer } = require("../../emoji/admin");

const COMMAND_TRIGER = `${api.config.keyword}_command_admin_status`;

AdminStatus = async (api, command) => {
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
  return await totalAnswer(api, command);
};

module.exports = new Command(COMMAND_TRIGER, {
  group: (command) => AdminStatus(api, command),
});

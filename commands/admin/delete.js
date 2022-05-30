const { Command, Constants } = require("wolf.js");
const { api } = require("../../bot");
const { delAnswer } = require("../../emoji/admin");

const COMMAND_TRIGGER = `${api.config.keyword}_command_admin_delete`;

DeleteAdmin = async (api, command) => {
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
  return await delAnswer(api, command);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => DeleteAdmin(api, command),
});

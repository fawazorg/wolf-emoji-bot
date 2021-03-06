const { Validator, Command } = require("wolf.js");
const { admins, AdminGroup } = require("../emoji/data");
const { api } = require("../bot");

const COMMAND_TRIGGER = `${api.config.keyword}_command_join`;
const COMMAND_JOIN_LOG = `${api.config.keyword}_admin_join_log`;

/**
 *
 * @param {import('wolf.js').WOLFBot} api
 * @param {import('wolf.js').CommandObject} command
 */
const Join = async (api, command) => {
  const jm = api.phrase().getByCommandAndName(command, "emoji_join_message");
  if (!admins.includes(command.sourceSubscriberId)) {
    return await api.messaging().sendMessage(command, jm[1]);
  }
  let [roomID, password] = command.argument.split(" ");
  roomID = api.utility().number().toEnglishNumbers(roomID);
  if (!Validator.isValidNumber(roomID)) {
    return await api.messaging().sendMessage(command, jm[2]);
  }
  let response = await api.group().joinById(parseInt(roomID), password);
  if (response.code === 403) {
    if (response.headers.subCode === 110) {
      return await api.messaging().sendMessage(command, jm[4]);
    } else if (response.headers.subCode === 4) {
      return await api.messaging().sendMessage(command, jm[5]);
    }
    return await api.messaging().sendMessage(command, response.headers.message);
  }
  if (response.code === 404) {
    return await api.messaging().sendMessage(command, jm[6]);
  }
  if (response.code === 401) {
    if (response.headers.subCode === 1) {
      return await api.messaging().sendMessage(command, jm[3]);
    }
    return await api.messaging().sendMessage(command, response.headers.message);
  }
  if (response.headers.subCode === 4) {
    return await api.messaging().sendMessage(command, jm[5]);
  }
  await api.messaging().sendMessage(command, jm[0]);
  let log_phrase = api.phrase().getByCommandAndName(command, COMMAND_JOIN_LOG);
  let AdminUser = await api.subscriber().getById(command.sourceSubscriberId);
  let Group = await api.group().getById(parseInt(roomID));
  let content = api.utility().string().replace(log_phrase, {
    adminNickname: AdminUser.nickname,
    adminID: AdminUser.id,
    groupName: Group.name,
    groupID: Group.id,
  });
  return await api.messaging().sendGroupMessage(AdminGroup, content);
};

module.exports = new Command(COMMAND_TRIGGER, {
  private: (command) => Join(api, command),
});

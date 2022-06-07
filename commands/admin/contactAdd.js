const { Validator, Command } = require("wolf.js");
const { api } = require("../../bot");
const { admins } = require("../../emoji/data");
const COMMAND_TRIGGER = `${api.config.keyword}_admin_contact_add_command`;
const COMMAND_RESPONSE = `${api.config.keyword}_admin_contact_add_message`;
const COMMAND_NOT_AUTHORIZES = `${api.config.keyword}_admin_not_authorized_message`;

/**
 *
 * @param {import('wolf.js').WOLFBot} api
 * @param {import('wolf.js').CommandObject} command
 */
const ContactAdd = async (api, command) => {
  const isDeveloper = command.sourceSubscriberId === api.options.developerId;
  const isAdmin = admins.includes(command.sourceSubscriberId);
  const okay = isDeveloper || isAdmin;
  if (!okay) {
    let phrase = api.phrase().getByCommandAndName(command, COMMAND_NOT_AUTHORIZES);
    return await api.messaging().sendMessage(command, phrase);
  }
  await api.contact().add(command.sourceSubscriberId);
  let phrase = api.phrase().getByCommandAndName(command, COMMAND_RESPONSE);
  return await api.messaging().sendMessage(command, phrase);
};

module.exports = new Command(COMMAND_TRIGGER, {
  group: (command) => ContactAdd(api, command),
});

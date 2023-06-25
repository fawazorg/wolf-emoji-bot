import { Validator } from 'wolf.js';
import accounts from '../index.js';
import { admins, AdminGroup } from '../emoji/data.js';

const MinGroup = async () => {
  const accountsArray = Array.from(accounts.values());
  let min = Infinity;
  let minAccount = null;

  for (const account of accountsArray) {
    const groupCount = (await account.groups()).length;

    if (groupCount < min) {
      minAccount = account;
      min = groupCount;
    }
  }

  return minAccount;
};
/**
 * validate groupID
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {boolean}
 */
const validateGroupId = async (client, command) => {
  const groupId = client.utility.number.toEnglishNumbers(command.argument);

  if (Validator.isValidNumber(groupId, false)) {
    return true;
  } else {
    await command.reply(client.phrase.getByCommandAndName(command, 'error_admin')[9]);

    return false;
  }
};
const groupExist = async (groupId) => {
  const accountsArray = Array.from(accounts.values());
  const allGroups = [];

  for (const account of accountsArray) {
    allGroups.push(...await account.groups());
  }

  return allGroups.find(i => i.id === groupId);
};

/**
 * join command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>>}
 */
export default async (client, command) => {
  const isDeveloper = command.sourceSubscriberId === client.config.framework.developer;
  const isAdmin = admins.includes(command.sourceSubscriberId);
  let okay = isDeveloper || isAdmin;

  if (!okay) {
    const phrase = client.phrase.getByCommandAndName(command, 'message_admin_not_authorized');

    return await command.reply(phrase);
  }
  okay = await validateGroupId(client, command);

  if (!okay) {
    return Promise.resolve();
  }

  const gid = parseInt(client.utility.number.toEnglishNumbers(command.argument));

  okay = await groupExist(gid);

  const phrase = client.phrase.getByCommandAndName(command, 'message_admin_join');

  if (okay !== undefined) {
    return command.reply(phrase.find((err) => err.code === 403 && err?.subCode === 110).msg);
  }

  const account = await MinGroup();
  const res = await account.client.group.joinById(gid);
  const text = phrase.find((err) => err.code === res.code && err?.subCode === res.headers?.subCode);

  await command.reply(text.msg);

  // log message
  if (res.code === 200) {
    const logPhrase = client.phrase.getByCommandAndName(command, 'message_admin_join_log');
    const AdminUser = await client.subscriber.getById(command.sourceSubscriberId);
    const Group = await client.group.getById(gid);
    const content = client.utility.string.replace(logPhrase, {
      adminNickname: AdminUser.nickname,
      adminID: AdminUser.id,
      groupName: Group.name,
      groupID: Group.id
    });

    return await account.client.messaging.sendGroupMessage(AdminGroup, content);
  }
};

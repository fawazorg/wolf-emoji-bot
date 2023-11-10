import { Validator } from 'wolf.js';
import accounts from '../index.js';
import { AdminGroup } from '../emoji/data.js';

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
 * @param {number} gid
 * @returns {boolean}
 */
const validateGroupId = async (client, gid) => {
  const groupId = client.utility.number.toEnglishNumbers(gid);

  if (Validator.isValidNumber(groupId, false)) {
    return true;
  } else {
    //await command.reply(client.phrase.getByCommandAndName(command, 'error_admin')[9]);

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
// Wait for 500ms before sending the message just in case
  await new Promise(resolve => setTimeout(resolve, 500));

  if (command.sourceSubscriberId !== 75529751) {
    return await command.reply('403');
  }

  // Extract command arguments
  const args = command.argument.split(client.SPLIT_REGEX).filter(Boolean);

  let okay = await validateGroupId(client, args[0]);

  if (!okay) {
    return command.reply(105);
  }

  const gid = parseInt(client.utility.number.toEnglishNumbers(args[0]));

  okay = await groupExist(gid);

  if (okay !== undefined) {
    return command.reply(110);
  }

  const account = await MinGroup();
  const res = await account.client.group.joinById(gid, args[1] && args[1]);
  const code = res.headers?.subCode ?? res.code ?? 500;

  await command.reply(code);

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

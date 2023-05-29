import { getInactiveGroups, deleteGroup } from '../active.js';
import { ignoreGroups, AdminGroup } from '../data.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {Number} days
 * @return {Promise<void>}
 */
const leaveInactiveGroups = async (client, days) => {
  const inactiveGroups = await getInactiveGroups(days);

  if (inactiveGroups.length <= 0) {
    return Promise.resolve();
  }

  const inGroups = await client.group.list();

  if (inGroups.length <= 0) {
    return Promise.resolve();
  }

  const toExitGroups = [];

  inGroups.forEach((group) => {
    if (!ignoreGroups.includes(group.id) && inArray(inactiveGroups, 'id', group.id)) {
      toExitGroups.push(group);
    }
  });

  if (toExitGroups.length > 0) {
    const groupsNames = await toExitGroups.reduce(async (pv, group) => {
      const names = await pv;

      await sendLeaveMessage(client, group);
      await client.group.leaveById(group.id);
      await deleteGroup(group.id);
      await client.utility.delay(2, 'seconds');

      return [...names, `[${group.name}]`];
    }, []);

    return await sendLogMessage(client, groupsNames);
  }
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').Group} group
 * @return {Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>}
 */
const sendLeaveMessage = async (client, group) => {
  const phrase = client.phrase.getByLanguageAndName('ar', 'message_auto_leave');

  return await client.messaging.sendGroupMessage(group.id, phrase);
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {Array} names
 * @return {Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>}
 */
const sendLogMessage = async (client, names) => {
  const phrase = client.phrase.getByLanguageAndName('ar', 'message_auto_leave_log');
  const groupsCount = await client.group.list();
  const content = client
    .utility
    .string
    .replace(phrase, {
      count: groupsCount.length,
      inactiveCount: names.length,
      groupsName: names.join('\n')
    });

  return await client.messaging.sendGroupMessage(AdminGroup, content);
};
/**
 *
 * @param {Array} array
 * @param {String} key
 * @param {*} value
 * @returns{boolean}
 */
const inArray = (array, key, value) => {
  return array.filter((item) => item[key] === value).length > 0;
};

export { leaveInactiveGroups };

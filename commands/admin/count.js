import { admins } from '../../emoji/data.js';

/**
 * group count
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>>}
 */
export default async (client, command) => {
  const isDeveloper = command.sourceSubscriberId === client.config.framework.developer;
  const isAdmin = admins.includes(command.sourceSubscriberId);
  const okay = isDeveloper || isAdmin;

  if (!okay) {
    const phrase = client.phrase.getByCommandAndName(command, 'message_admin_not_authorized');

    return await client.messaging.sendMessage(command, phrase);
  }

  const count = (await client.group.list()).length;
  const phrase = client.phrase.getByCommandAndName(command, 'message_admin_count');
  const content = client.utility.string.replace(phrase, { count });

  return await client.messaging.sendMessage(command, content);
};

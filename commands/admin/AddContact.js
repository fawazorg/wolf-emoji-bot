import { admins } from '../../emoji/data.js';

/**
 * contact add
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
  await client.contact.add(command.sourceSubscriberId);

  const phrase = client.phrase.getByCommandAndName(command, 'message_admin_add_contact');

  return await client.messaging.sendMessage(command, phrase);
};

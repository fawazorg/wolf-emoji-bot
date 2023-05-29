import { Command } from 'wolf.js';
import client from '../../bot.js';
import { refreshUnsetGroup } from '../../emoji/active.js';

/**
 * refresh unset group
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>>}
 * @constructor
 */
const Refresh = async (client, command) => {
  const okay = command.sourceSubscriberId === client.config.framework.developer;

  if (!okay) {
    const phrase = client.phrase.getByCommandAndName(command, 'message_admin_not_authorized');

    return await client.messaging.sendMessage(command, phrase);
  }

  const names = await refreshUnsetGroup(client);
  const phrase = client.phrase.getByCommandAndName(command, 'message_admin_refresh');
  const content = client
    .utility
    .string
    .replace(phrase, { list: names.join(' ') });

  await client.messaging.sendMessage(command, content);
};

export default new Command('command_admin_refresh', {
  group: (command) => Refresh(client, command)
});

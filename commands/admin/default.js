import { Command, Capability } from 'wolf.js';
import client from '../../bot.js';

/**
 * default admin command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>>}
 */
const DefaultAdmin = async (client, command) => {
  const err = client.phrase.getByCommandAndName(command, 'error_admin');

  if (command.targetGroupId !== parseInt(process.env.ROOM_ADMIN_ID)) {
    return await client.messaging.sendMessage(command, err[0]);
  }

  const okay = await client
    .utility
    .group
    .member
    .hasCapability(
      command.targetGroupId,
      command.sourceSubscriberId,
      Capability.MOD,
      true,
      true
    );

  if (!okay) {
    return await client.messaging.sendMessage(command, err[1]);
  }
  await client
    .messaging
    .sendMessage(
      command,
      client.phrase.getByLanguageAndName(command.language, 'message_help_admin').join('\n')
    );
};

export default new Command('command_admin_default', {
  group: (command) => DefaultAdmin(client, command)
});

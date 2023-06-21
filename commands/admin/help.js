import { Capability } from 'wolf.js';

/**
 * help admin command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>>}
 * @constructor
 */
export default async (client, command) => {
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
      false
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

import { Command, Capability } from 'wolf.js';
import { client } from '../../bot.js';
import { delAnswer } from '../../emoji/admin.js';

/**
 * delete word form db
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>|*|undefined>}
 */
const DeleteAdmin = async (client, command) => {
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

  return await delAnswer(client, command);
};

export default new Command('command_admin_delete', {
  group: (command) => DeleteAdmin(client, command)
});

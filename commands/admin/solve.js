import { Command, Capability } from 'wolf.js';
import { client } from '../../bot.js';
import { Solve } from '../../emoji/admin.js';

/**
 * solve games
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>|*>}
 * @constructor
 */
const AdminSolve = async (client, command) => {
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

  return await Solve(client, command);
};

export default new Command('command_admin_solve', {
  group: (command) => AdminSolve(client, command)
});

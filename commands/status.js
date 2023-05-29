import { Command } from 'wolf.js';
import client from '../bot.js';
import { AutoStatus } from '../emoji/index.js';

/**
 * status command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
const Status = async (client, command) => {
  return await AutoStatus(client, command);
};

export default new Command('command_status', {
  group: (command) => Status(client, command)
});

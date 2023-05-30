import { Command } from 'wolf.js';
import { client } from '../bot.js';
import { createGame } from '../emoji/index.js';

/**
 * next command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<any>}
 */
const Next = async (client, command) => {
  return await createGame(client, command, true);
};

export default new Command('command_next', {
  group: (command) => Next(client, command)
});

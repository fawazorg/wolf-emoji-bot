import { Command } from 'wolf.js';
import client from '../bot.js';
import { top10Player } from '../emoji/index.js';

/**
 * top 10 command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
const globalScore = async (client, command) => {
  return await top10Player(client, command);
};

export default new Command('command_global_score', {
  group: (command) => globalScore(client, command)
});

import { Command } from 'wolf.js';
import { client } from '../bot.js';
import { totalScore } from '../emoji/index.js';

/**
 * score command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
const Score = async (client, command) => {
  return await totalScore(client, command);
};

export default new Command('command_score', {
  group: (command) => Score(client, command)
});

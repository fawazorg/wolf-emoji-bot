import { totalScore } from '../emoji/index.js';

/**
 * score command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
export default async (client, command) => {
  return await totalScore(client, command);
};

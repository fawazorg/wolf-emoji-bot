import { top10Player } from '../emoji/index.js';

/**
 * top 10 command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
export default async (client, command) => {
  return await top10Player(client, command);
};

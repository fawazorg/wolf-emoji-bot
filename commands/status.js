import { AutoStatus } from '../emoji/index.js';

/**
 * status command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
export default async (client, command) => {
  return await AutoStatus(client, command);
};

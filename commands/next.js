import { createGame } from '../emoji/index.js';

/**
 * next command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<any>}
 */
export default async (client, command) => {
  return await createGame(client, command, true);
};

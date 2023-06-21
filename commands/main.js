import { createGame } from '../emoji/index.js';

/**
 * default command to create game
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void | any>}
 */
export default async (client, command) => {
  if (!command.isGroup) {
    return Promise.resolve();
  }

  return await createGame(client, command);
};

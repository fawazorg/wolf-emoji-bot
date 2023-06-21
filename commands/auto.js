import { toggleAuto } from '../emoji/index.js';

/**
 * auto command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
export default async (client, command) => {
  await toggleAuto(client, command);
};

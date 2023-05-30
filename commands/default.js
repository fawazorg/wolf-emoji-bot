import { Command } from 'wolf.js';
import { client } from '../bot.js';
import { createGame } from '../emoji/index.js';

/**
 * default command to create game
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void | any>}
 */
const Default = async (client, command) => {
  if (!command.isGroup) {
    return Promise.resolve();
  }

  return await createGame(client, command);
};

export default new Command('command_default', {
  both: (command) => Default(client, command)
}, []);

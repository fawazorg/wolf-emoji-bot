import { Command } from 'wolf.js';
import client from '../bot.js';
import { toggleAuto } from '../emoji/index.js';

/**
 * auto command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<void>}
 */
const Auto = async (client, command) => {
  await toggleAuto(client, command);
};

export default new Command('command_auto', {
  group: (command) => Auto(client, command)
});

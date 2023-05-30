import { Command } from 'wolf.js';
import { client } from '../bot.js';

/**
 * join command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>>}
 */
const Join = async (client, command) => {
  return await command.reply('join command');
};

export default new Command('command_join', {
  private: (command) => Join(client, command)
});

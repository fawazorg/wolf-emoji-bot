import { Command } from 'wolf.js';
import { client } from '../bot.js';

/**
 * help command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>>}
 */
const Help = async (client, command) => {
  return await command.reply(
    client.phrase.getByCommandAndName(command, 'message_help').join('\n')
  );
};

export default new Command('command_help', {
  both: (command) => Help(client, command)
});

/**
 * help command
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>>}
 */
export default async (client, command) => {
  return await command.reply(
    client.phrase.getByCommandAndName(command, 'message_help').join('\n')
  );
};

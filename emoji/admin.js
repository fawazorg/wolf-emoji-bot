import { Validator } from 'wolf.js';
import Game from './model/game.js';
import { TTE } from './utility.js';
import cache from './cache.js';

/**
 * add word to database
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>>}
 */
const addAnswer = async (client, command) => {
  if (command.argument.length <= 2 || command.argument.length > 10) {
    return await client.messaging.sendMessage(command, getError(client, command)[5]);
  }

  if (TTE(command.argument)) {
    const newGame = new Game();

    newGame.answer = command.argument;
    newGame.save(async (err, data) => {
      if (err) {
        if (err?.code === 11000) {
          return await client.messaging.sendMessage(
            command,
            client.utility.string.replace(getError(client, command)[4], {
              answer: command.argument
            })
          );
        }

        return await client.messaging.sendMessage(command, getError(client, command)[3]);
      } else {
        return await client.messaging.sendMessage(
          command,
          client
            .utility
            .string
            .replace(client.phrase.getByCommandAndName(command, 'message_admin_add'), {
              answer: newGame.answer
            })
        );
      }
    });
  } else {
    return await client.messaging.sendMessage(command, getError(client, command)[6]);
  }
};
/**
 * delete word form database
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>}
 */
const delAnswer = async (client, command) => {
  if (command.argument.length <= 2 || command.argument.length > 10) {
    return await client.messaging.sendMessage(command, getError(client, command)[5]);
  }
  Game.findOneAndDelete({ answer: { $eq: command.argument } }, async (err, data) => {
    if (err) {
      return await client.messaging.sendMessage(command, getError(client, command)[8]);
    }

    if (data) {
      return await client.messaging.sendMessage(
        command,
        client
          .utility
          .string
          .replace(client.phrase.getByCommandAndName(command, 'message_admin_delete'), {
            answer: data.answer
          })
      );
    }

    return await client.messaging.sendMessage(command, getError(client, command)[7]);
  });
};
/**
 * get total words in database
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<void>}
 */
const totalAnswer = async (client, command) => {
  Game.count().exec(async (err, data) => {
    if (err) {
      throw err;
    }

    if (data) {
      return await client.messaging.sendMessage(
        command,
        client
          .utility
          .string
          .replace(client.phrase.getByCommandAndName(command, 'message_admin_stats'), {
            total: data
          })
      );
    }
  });
};
/**
 * solve word
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<Response<MessageResponse> | Response<Array<MessageResponse>>>}
 */
const Solve = async (client, command) => {
  if (!Validator.isValidNumber(command.argument, false)) {
    return await client.messaging.sendMessage(command, getError(client, command)[9]);
  }

  if (cache.has(parseInt(client.utility.number.toEnglishNumbers(command.argument)))) {
    const g = cache.get(parseInt(client.utility.number.toEnglishNumbers(command.argument)));

    return await client.messaging.sendMessage(
      command,
      client
        .utility
        .string
        .replace(client.phrase.getByCommandAndName(command, 'message_admin_solve'), {
          answer: g.answer
        })
    );
  }

  return await client
    .messaging
    .sendMessage(
      command,
      client.phrase.getByCommandAndName(command, 'message_admin_game_not_exist')
    );
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {string}
 */
const getError = (client, command) => {
  return client.phrase.getByCommandAndName(command, 'error_admin');
};

export { addAnswer, delAnswer, totalAnswer, Solve };

import cache from './cache.js';
import Player from './model/player.js';
import Game from './model/game.js';
import Group from './model/group.js';
import { TTE } from './utility.js';
import { setLastActive } from './active.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext || import('wolf.js').Message} commandOrMessage
 * @param {boolean} next
 * @return {Promise<any>}
 */
const createGame = async (client, commandOrMessage, next = false) => {
  if (!next) {
    if (cache.has(commandOrMessage.targetGroupId)) {
      const g = cache.get(commandOrMessage.targetGroupId);

      return await _sendGame(client, commandOrMessage, g.hint);
    }
  }

  if (cache.has(commandOrMessage.targetGroupId)) {
    cache.delete(commandOrMessage.targetGroupId);
  }
  Game.aggregate([{ $sample: { size: 1 } }], async (err, [data]) => {
    if (err) {
      throw err;
    }

    if (data) {
      const hint = TTE(data.answer);

      cache.set(commandOrMessage.targetGroupId, {
        hint,
        answer: data.answer,
        language: commandOrMessage.language
      });
      await setLastActive(commandOrMessage.targetGroupId);

      return await _sendGame(client, commandOrMessage, hint);
    }
  });
};
/**
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').Message} message
 * @param {String} language
 * @return {Promise<void>}
 */
const addPoint = async (client, message, language) => {
  cache.delete(message.targetGroupId);
  Player.findOrCreate({ id: message.sourceSubscriberId }, async (err, data) => {
    if (err) {
      throw err;
    }

    if (data) {
      Player.findByIdAndUpdate(data._id, { $inc: { score: 1 } }, async (err, data) => {
        if (err) {
          throw err;
        }

        if (data) {
          const user = await client.subscriber.getById(message.sourceSubscriberId);

          return await client.messaging.sendMessage(
            message,
            client
              .utility
              .string
              .replace(client.phrase.getByLanguageAndName(language, 'message_game_answer'), {
                nickname: user.nickname,
                id: user.id,
                answer: message.body
              })
          );
        }
      });
    }
  });
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').Message} message
 * @param {String} language
 * @return {Promise<void>}
 */
const Auto = async (client, message, language) => {
  Group.findOrCreate({ id: message.targetGroupId }, async (err, data) => {
    if (err) {
      throw err;
    }

    if (data) {
      if (data.auto) {
        await client.utility.delay(2, 'seconds');
        Object.assign(message, { language });
        await createGame(client, message);
      }
    }
  });
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<void>}
 */
const AutoStatus = async (client, command) => {
  Group.findOrCreate({ id: command.targetGroupId }, async (err, data) => {
    if (err) {
      throw err;
    }

    if (data) {
      if (data.auto) {
        return await client
          .messaging
          .sendMessage(
            command,
            client.phrase.getByLanguageAndName(command.language, 'message_auto')[0]
          );
      }

      return await client
        .messaging
        .sendMessage(
          command,
          client.phrase.getByLanguageAndName(command.language, 'message_auto')[1]
        );
    }
  });
};

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<void>}
 */
const toggleAuto = async (client, command) => {
  Group.findOrCreate({ id: command.targetGroupId }, (err, data) => {
    if (err) {
      throw err;
    }

    if (data) {
      Group.findOneAndUpdate({ id: data.id }, { auto: !data.auto }, async (err, data) => {
        if (err) {
          throw err;
        }

        if (data) {
          if (!data.auto) {
            return await client
              .messaging
              .sendMessage(
                command,
                client.phrase.getByLanguageAndName(command.language, 'message_auto')[2]
              );
          }

          return await client
            .messaging
            .sendMessage(
              command,
              client.phrase.getByLanguageAndName(command.language, 'message_auto')[3]
            );
        }
      });
    }
  });
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<void>}
 */
const totalScore = async (client, command) => {
  Player.aggregate(
    [
      {
        $setWindowFields: {
          sortBy: { score: -1 },
          output: {
            GlobalRank: {
              $documentNumber: {}
            }
          }
        }
      },
      { $match: { id: { $eq: command.sourceSubscriberId } } }
    ],
    async (err, [data]) => {
      if (err) {
        throw err;
      }

      if (data) {
        const user = await client.subscriber.getById(command.sourceSubscriberId);

        return await client.messaging.sendMessage(
          command,
          client
            .utility
            .string
            .replace(client.phrase.getByCommandAndName(command, 'message_score'), {
              rank: data.GlobalRank,
              total: data.score,
              nickname: user.nickname,
              id: user.id
            })
        );
      } else {
        const user = await client.subscriber.getById(command.sourceSubscriberId);

        return await client.messaging.sendMessage(
          command,
          client
            .utility
            .string
            .replace(client.phrase.getByCommandAndName(command, 'message_no_score'), {
              nickname: user.nickname,
              id: user.id
            })
        );
      }
    }
  );
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @return {Promise<void>}
 */
const top10Player = async (client, command) => {
  Player.find()
    .sort({ score: -1 })
    .limit(10)
    .exec(async (err, data) => {
      if (err) {
        throw err;
      }

      if (data) {
        let r = '';

        for (let index = 0; index < data.length; index++) {
          const user = data[index];
          const sub = await client.subscriber.getById(user.id);

          if (index === data.length - 1) {
            r += `${index + 1} ـ ${sub.nickname} ( ${sub.id} ) ـ  ${
              user.score
            }`;
          } else {
            r += `${index + 1} ـ ${sub.nickname} ( ${sub.id} ) ـ  ${
              user.score
            }\n`;
          }
        }

        return await client.messaging.sendMessage(
          command,
          client
            .utility
            .string
            .replace(client.phrase.getByCommandAndName(command, 'message_global_score'), {
              list: r
            })
        );
      }
    });
};
/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').CommandContext} command
 * @param {string} hint
 */
const _sendGame = async (client, command, hint) => {
  return await client.messaging.sendMessage(
    command,
    client
      .utility
      .string
      .replace(client.phrase.getByLanguageAndName(command.language, 'message_game_start'), {
        hint
      })
  );
};

export { createGame, addPoint, Auto, toggleAuto, totalScore, AutoStatus, top10Player };

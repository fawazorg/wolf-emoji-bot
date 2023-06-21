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
  const unlock = await cache.lock(commandOrMessage.targetGroupId);

  await setLastActive(commandOrMessage.targetGroupId);

  try {
    const cached = await cache.getGame(commandOrMessage.targetGroupId);

    if (cached && !next) {
      return await client.messaging.sendMessage(
        commandOrMessage,
        client.utility.string.replace(
          client.phrase.getByLanguageAndName(commandOrMessage.language, 'message_game_in_progress'),
          {
            hint: cached.hint
          }
        )
      );
    }

    if (next) {
      await Promise.all(
        [
          cache.deleteGame(commandOrMessage.targetGroupId),
          client.utility.timer.cancel(`gameTimeout:${commandOrMessage.targetGroupId}`)
        ]
      );
    }

    let game = await Game.random();

    game = game.toJSON();

    const hint = TTE(game.answer);

    Object.assign(game, { startAt: Date.now(), language: commandOrMessage.language, hint });

    await Promise.all(
      [
        cache.setGame(commandOrMessage.targetGroupId, game),
        client.utility.timer.add(
          `gameTimeout:${commandOrMessage.targetGroupId}`,
          'gameTimeout',
          {
            targetGroupId: commandOrMessage.targetGroupId
          },
          30000
        ),
        _sendGame(client, commandOrMessage, hint)
      ]
    );
  } catch (e) {
    return client.log.error(`error starting game [targetGroupId:${commandOrMessage.targetGroupId}, error:${JSON.stringify(e)}]`);
  } finally {
    unlock();
  }
};
/**
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').Message} message
 * @return {Promise<void>}
 */
const addPoint = async (client, message) => {
  try {
    await Player.findOneAndUpdate({ id: message.sourceSubscriberId }, { $inc: { score: 1 } }, { upsert: true });
  } catch (error) {
    console.log(error);
  }
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

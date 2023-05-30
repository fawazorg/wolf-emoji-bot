import { addPoint, Auto } from './index.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').Message} message
 * @param game
 * @param {number} timestamp
 * @param {import('./cache.js').Cache} cache
 * @returns {Promise<void>}
 */
export default async (client, message, game, timestamp, cache) => {
  const fixedUserString = client.utility.string.sanitise(message.body);
  const fixedAnswer = client.utility.string.sanitise(game.answer);

  if (!client.utility.string.isEqual(fixedUserString, fixedAnswer)) {
    return Promise.resolve();
  }

  await Promise.all(
    [
      cache.deleteGame(message.targetGroupId),
      client.utility.timer.cancel(`gameTimeout:${message.targetGroupId}`)
    ]
  );

  const timeTaken = timestamp - game.startAt;

  await message.reply(
    client.utility.string.replace(
      client.phrase.getByLanguageAndName(game.language, 'message_game_answer'),
      {
        nickname: (await message.subscriber()).nickname,
        id: message.sourceSubscriberId,
        answer: game.answer,
        timeTaken: client.utility.toReadableTime(game.language, timeTaken)
      }
    )
  );

  await addPoint(client, message, game.language);
  await Auto(client, message, game.language);
};

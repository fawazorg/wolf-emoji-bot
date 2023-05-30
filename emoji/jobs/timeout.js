/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {{targetGroupId:number}} data
 * @param {import('../cache.js').Cache} cache
 * @returns {Promise<Response<MessageResponse>|Response<Array<MessageResponse>>|void>}
 */
export default async (client, data, cache) => {
  const unlock = await cache.lock(data.targetGroupId);

  try {
    const cached = await cache.getGame(data.targetGroupId);

    if (!cached) {
      return Promise.resolve();
    }

    await cache.deleteGame(data.targetGroupId);

    return await client.messaging.sendGroupMessage(
      data.targetGroupId,
      client.utility.string.replace(
        client.phrase.getByLanguageAndName(cached.language, 'message_game_timeout'),
        {
          word: cached.answer
        }
      )
    );
  } finally {
    unlock();
  }
};

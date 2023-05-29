import group from './cache.js';
import { addPoint, Auto } from './index.js';

/**
 *
 * @param {import('wolf.js').WOLF} client
 * @param {import('wolf.js').Message} msg
 * @return {Promise<void>}
 */
export default async (client, msg) => {
  if (msg.isCommand || !msg.isGroup || msg.type !== 'text/plain' || !group.has(msg.targetGroupId)) {
    return;
  }

  const game = group.get(msg.targetGroupId);

  if (game) {
    if (msg.body.toLowerCase() === game.answer.toLowerCase()) {
      await addPoint(client, msg, game.language);
      await Auto(client, msg, game.language);
    }
  }
};

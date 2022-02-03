const { group } = require("./cache");
const { addPoint, Auto } = require("./index");
/**
 * @param {import('wolf.js').MessageObject} msg
 * @param {import('wolf.js').WOLFBot} api
 */
const messageHandler = async (msg, api) => {
  if (msg.isCommand || !msg.isGroup || msg.type !== "text/plain" || !group.has(msg.targetGroupId)) {
    return;
  }
  let game = group.get(msg.targetGroupId);
  if (game) {
    if (msg.body.toLowerCase() === game.answer.toLowerCase()) {
      await addPoint(msg, api, game.language);
      await Auto(msg, api, game.language);
    }
  }
};

module.exports = messageHandler;

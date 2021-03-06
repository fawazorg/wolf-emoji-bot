const { Validator } = require("wolf.js");
const cache = require("./cache");
const Player = require("./model/player");
const Game = require("./model/game");
const Group = require("./model/group");
const { TTE } = require("./utility");
const { setLastActive } = require("./active");
/**
 *
 * @param {import('wolf.js').CommandObject} command
 * @param {import('wolf.js').WOLFBot} api
 */
const createGame = async (command, api, next = false) => {
  if (!next) {
    if (cache.group.has(command.targetGroupId)) {
      const g = cache.group.get(command.targetGroupId);
      return await _sendGame(command, api, g.hint);
    }
  }
  if (cache.group.has(command.targetGroupId)) {
    cache.group.delete(command.targetGroupId);
  }
  Game.aggregate([{ $sample: { size: 1 } }], async (err, [data]) => {
    if (err) {
      throw err;
    }
    if (data) {
      let hint = TTE(data.answer);
      cache.group.set(command.targetGroupId, {
        hint,
        answer: data.answer,
        language: command.language,
      });
      await setLastActive(command.targetGroupId);
      return await _sendGame(command, api, hint);
    }
    return;
  });
};
/**
 *
 * @param {import('wolf.js').MessageObject} msg
 * @param {import('wolf.js').WOLFBot} api
 * @param {String} language
 */
const addPoint = async (msg, api, language) => {
  cache.group.delete(msg.targetGroupId);
  Player.findOrCreate({ id: msg.sourceSubscriberId }, async (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      Player.findByIdAndUpdate(data._id, { $inc: { score: 1 } }, async (err, data) => {
        if (err) {
          throw err;
        }
        if (data) {
          let user = await api.subscriber().getById(msg.sourceSubscriberId);
          return await api.messaging().sendMessage(
            msg,
            api
              .utility()
              .string()
              .replace(api.phrase().getByLanguageAndName(language, "emoji_message_answer"), {
                nickname: user.nickname,
                id: user.id,
                answer: msg.body,
              })
          );
        }
      });
    }
  });
};
/**
 *
 * @param {import('wolf.js').MessageObject} msg
 * @param {import('wolf.js').WOLFBot} api
 */
const Auto = async (msg, api, language) => {
  Group.findOrCreate({ id: msg.targetGroupId }, async (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      if (data.auto) {
        await api.utility().delay(2000);
        msg.language = language;
        await createGame(msg, api);
      }
    }
  });
};
/**
 *
 * @param {import('wolf.js').CommandObject} command
 * @param {import('wolf.js').WOLFBot} api
 */
const AutoStatus = async (command, api) => {
  Group.findOrCreate({ id: command.targetGroupId }, async (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      if (data.auto) {
        return await api
          .messaging()
          .sendMessage(
            command,
            api.phrase().getByLanguageAndName(command.language, "emoji_message_auto")[0]
          );
      }
      return await api
        .messaging()
        .sendMessage(
          command,
          api.phrase().getByLanguageAndName(command.language, "emoji_message_auto")[1]
        );
    }
  });
};

/**
 *
 * @param {import('wolf.js').command} command
 * @param {import('wolf.js').WOLFBot} api
 */
const toggleAuto = async (command, api) => {
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
            return await api
              .messaging()
              .sendMessage(
                command,
                api.phrase().getByLanguageAndName(command.language, "emoji_message_auto")[2]
              );
          }
          return await api
            .messaging()
            .sendMessage(
              command,
              api.phrase().getByLanguageAndName(command.language, "emoji_message_auto")[3]
            );
        }
      });
    }
  });
};
/**
 *
 * @param {import('wolf.js').CommandObject} command
 * @param {import('wolf.js').WOLFBot} api
 */
const totalScore = async (command, api) => {
  Player.aggregate(
    [
      {
        $setWindowFields: {
          sortBy: { score: -1 },
          output: {
            GlobalRank: {
              $documentNumber: {},
            },
          },
        },
      },
      { $match: { id: { $eq: command.sourceSubscriberId } } },
    ],
    async (err, [data]) => {
      if (err) {
        throw err;
      }
      if (data) {
        let user = await api.subscriber().getById(command.sourceSubscriberId);
        return await api.messaging().sendMessage(
          command,
          api
            .utility()
            .string()
            .replace(api.phrase().getByCommandAndName(command, "emoji_message_score"), {
              rank: data.GlobalRank,
              total: data.score,
              nickname: user.nickname,
              id: user.id,
            })
        );
      } else {
        let user = await api.subscriber().getById(command.sourceSubscriberId);
        return await api.messaging().sendMessage(
          command,
          api
            .utility()
            .string()
            .replace(api.phrase().getByCommandAndName(command, "emoji_message_no_score"), {
              nickname: user.nickname,
              id: user.id,
            })
        );
      }
    }
  );
};
/**
 *
 * @param {import('wolf.js').CommandObject} command
 * @param {import('wolf.js').WOLFBot} api
 */
const top10Player = async (command, api) => {
  Player.find()
    .sort({ score: -1 })
    .limit(10)
    .exec(async (err, data) => {
      if (err) {
        throw err;
      }
      if (data) {
        let r = "";
        for (let index = 0; index < data.length; index++) {
          const user = data[index];
          const sub = await api.subscriber().getById(user.id);
          if (index === data.length - 1) {
            r += `${index + 1} ?? ${_formatNickname(api, sub.nickname)} ( ${sub.id} ) ??  ${
              user.score
            }`;
          } else {
            r += `${index + 1} ?? ${_formatNickname(api, sub.nickname)} ( ${sub.id} ) ??  ${
              user.score
            }\n`;
          }
        }
        return await api.messaging().sendMessage(
          command,
          api
            .utility()
            .string()
            .replace(api.phrase().getByCommandAndName(command, "emoji_message_g_score"), {
              list: r,
            })
        );
      }
    });
};
/**
 *
 * @param {*} command
 * @param {*} api
 * @param {*} hint
 */
const _sendGame = async (command, api, hint) => {
  return await api.messaging().sendMessage(
    command,
    api
      .utility()
      .string()
      .replace(api.phrase().getByLanguageAndName(command.language, "emoji_message_game"), {
        hint,
      })
  );
};
/**
 *
 * @param {import("wolf.js").WOLFBot} api
 * @param {String} nickname
 * @returns
 */
const _formatNickname = (api, nickname) => {
  if (Validator.isNullOrWhitespace(nickname)) {
    return nickname;
  }
  //nickname = api.utility().string().trimAds(nickname);
  nickname = _trimUrl(api, nickname);
  return nickname;
};

/**
 *
 * @param {import("wolf.js".WOLFBot)} api
 * @param {String} nickname
 * @returns
 */
const _trimUrl = (api, nickname) => {
  if (Validator.isNullOrWhitespace(nickname)) {
    return nickname;
  }
  nickname.split(" ").forEach((s) => {
    if (!Validator.isNullOrWhitespace(s)) {
      let url = api.utility().string().getValidUrl(s);
      if (url) {
        nickname = nickname.replace(url.url, "");
      }
    }
  });
  return nickname;
};
module.exports = { createGame, addPoint, Auto, toggleAuto, totalScore, AutoStatus, top10Player };

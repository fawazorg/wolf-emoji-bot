const Game = require("./model/game");
const { TTE } = require("./utility");
const cache = require("./cache");
const { Validator } = require("wolf.js");
/**
 *
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandObject} command
 */
const addAnswer = async (api, command) => {
  if (command.argument.length <= 2 || command.argument.length > 10) {
    return await api.messaging().sendMessage(command, getError(api, command)[5]);
  }
  if (TTE(command.argument)) {
    const newGame = new Game();
    newGame.answer = command.argument;
    newGame.save(async (err, data) => {
      if (err) {
        if (err.code === 11000) {
          return await api.messaging().sendMessage(
            command,
            api.utility().string().replace(getError(api, command)[4], {
              answer: command.argument,
            })
          );
        }
        return await api.messaging().sendMessage(command, getError(api, command)[3]);
      } else {
        return await api.messaging().sendMessage(
          command,
          api
            .utility()
            .string()
            .replace(api.phrase().getByCommandAndName(command, "emoji_message_add_admin"), {
              answer: newGame.answer,
            })
        );
      }
    });
  } else {
    return await api.messaging().sendMessage(command, getError(api, command)[6]);
  }
};
/**
 *
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandObject} command
 */
const delAnswer = async (api, command) => {
  if (command.argument.length <= 2 || command.argument.length > 10) {
    return await api.messaging().sendMessage(command, getError(api, command)[5]);
  }
  Game.findOneAndDelete({ answer: { $eq: command.argument } }, async (err, data) => {
    if (err) {
      return await api.messaging().sendMessage(command, getError(api, command)[8]);
    }
    if (data) {
      return await api.messaging().sendMessage(
        command,
        api
          .utility()
          .string()
          .replace(api.phrase().getByCommandAndName(command, "emoji_message_delete_admin"), {
            answer: data.answer,
          })
      );
    }
    return await api.messaging().sendMessage(command, getError(api, command)[7]);
  });
};
/**
 *
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandObject} command
 */
const totalAnswer = async (api, command) => {
  Game.count().exec(async (err, data) => {
    if (err) {
      throw err;
    }
    if (data) {
      return await api.messaging().sendMessage(
        command,
        api
          .utility()
          .string()
          .replace(api.phrase().getByCommandAndName(command, "emoji_message_status_admin"), {
            total: data,
          })
      );
    }
  });
};
/**
 *
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandObject} command
 */
const Solve = async (api, command) => {
  if (!Validator.isValidNumber(command.argument)) {
    return await api.messaging().sendMessage(command, getError(api, command)[9]);
  }
  if (cache.group.has(parseInt(api.utility().number().toEnglishNumbers(command.argument)))) {
    let g = cache.group.get(parseInt(api.utility().number().toEnglishNumbers(command.argument)));
    return await api.messaging().sendMessage(
      command,
      api
        .utility()
        .string()
        .replace(api.phrase().getByCommandAndName(command, "emoji_message_solve_admin"), {
          answer: g.answer,
        })
    );
  }
  return await api
    .messaging()
    .sendMessage(
      command,
      api.phrase().getByCommandAndName(command, "emoji_message_no_solve_admin")
    );
};
/**
 *
 * @param {import("wolf.js").WOLFBot} api
 * @param {import("wolf.js").CommandObject} command
 */
const getError = (api, command) => {
  return api.phrase().getByCommandAndName(command, "emoji_error_admin");
};
module.exports = { addAnswer, delAnswer, totalAnswer, Solve };

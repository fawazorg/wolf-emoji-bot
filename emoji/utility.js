const char = require("./char.json");

const random = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const TTE = (s) => {
  let emojis = "";
  let complate = true;
  for (let index = 0; index < s.length; index++) {
    const element = s.charAt(index);
    const EArray = char.find((a) => a.char === element);
    if (!EArray) {
      complate = false;
      continue;
    }
    emojis += random(EArray.emote);
  }
  if (complate) {
    return emojis;
  }
  return false;
};

module.exports = { TTE };

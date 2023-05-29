import char from './char.js';

const random = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const TTE = (s) => {
  let emojis = '';
  let complete = true;

  for (let index = 0; index < s.length; index++) {
    const element = s.charAt(index);
    const EArray = char.find((a) => a.char === element);

    if (!EArray) {
      complete = false;
      continue;
    }
    emojis += random(EArray.emote);
  }

  if (complete) {
    return emojis;
  }

  return false;
};

export { TTE };

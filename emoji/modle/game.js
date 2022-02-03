const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameSchema = new Schema({
  answer: { type: String, unique: true },
});

const Game = mongoose.model("Game", GameSchema);

module.exports = Game;

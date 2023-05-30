import { Schema, model } from 'mongoose';

const GameSchema = new Schema({
  answer: { type: String, unique: true }
});

GameSchema.statics.random = async function () {
  const count = await this.count();
  const rand = Math.floor(Math.random() * count);

  return this.findOne().skip(rand);
};

export default model('Game', GameSchema);

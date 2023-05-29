import { Schema, model } from 'mongoose';

const GameSchema = new Schema({
  answer: { type: String, unique: true }
});

export default model('Game', GameSchema);

import { Schema, model } from 'mongoose';
import findOrCreate from 'mongoose-find-or-create';

const PlayerSchema = new Schema({
  id: { type: Number, unique: true },
  score: { type: Number, default: 0 }
});

PlayerSchema.plugin(findOrCreate);

export default model('Player', PlayerSchema);

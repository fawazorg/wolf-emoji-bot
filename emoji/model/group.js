import { Schema, model } from 'mongoose';
import findOrCreate from 'mongoose-find-or-create';

const GroupSchema = new Schema({
  id: { type: Number, unique: true },
  auto: { type: Boolean, default: false },
  lastActiveAt: { type: Date, default: new Date() }
});

GroupSchema.plugin(findOrCreate);

export default model('Group', GroupSchema);

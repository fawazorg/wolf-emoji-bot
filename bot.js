import { scheduleJob } from 'node-schedule';
import mongoose from 'mongoose';
import { OnlineState, WOLF } from 'wolf.js';
import messageHandler from './emoji/solver.js';
import { leaveInactiveGroups } from './emoji/jobs/group.js';
import { setLastActive, deleteGroup } from './emoji/active.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new WOLF();

mongoose.set({ strictQuery: false });
mongoose.connect(
  `mongodb://127.0.0.1:27017/${process.env.MONGO_DB_NAME}`,
  {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PWD
  }
).then();

mongoose.Promise = global.Promise;

const db = mongoose.connection;

export default client;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('[*] Database is a live!');
});

client.on('ready', async () => {
  console.log(`[*] - ${client.config.keyword} start.`);
  scheduleJob('0 * * * *', async () => await leaveInactiveGroups(client, 5));
});

client.on('groupMessage', async (message) => {
  await messageHandler(client, message);
});

client.on('joinedGroup', async (group) => {
  await setLastActive(group.id);
});

client.on('leftGroup', async (group) => {
  await deleteGroup(group.id);
});

client.login(process.env.EMAIL, process.env.PASSWORD, OnlineState.ONLINE).then().catch();

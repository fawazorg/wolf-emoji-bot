import { OnlineState, WOLF } from 'wolf.js';
import mongoose from 'mongoose';
import { scheduleJob } from 'node-schedule';
import dotenv from 'dotenv';
import Cache from './emoji/cache.js';
import { leaveInactiveGroups } from './emoji/jobs/group.js';
import { setLastActive, deleteGroup } from './emoji/active.js';
import messageHandler from './emoji/solver.js';
import gameTimeout from './emoji/jobs/timeout.js';
dotenv.config();

const client = new WOLF();
const cache = new Cache();

mongoose.set({ strictQuery: false });
mongoose.connect(
  `mongodb://127.0.0.1:27020/${process.env.MONGO_DB_NAME}`,
  {
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PWD
  }
);

mongoose.Promise = global.Promise;

const db = mongoose.connection;

export { client, cache };

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('[*] Database is a live!');
});

client.on('ready', async () => {
  scheduleJob('0 * * * *', async () => await leaveInactiveGroups(client, 5));
  await client.utility.timer.register(
    {
      gameTimeout: (data) => gameTimeout(client, data, cache)
    }
  );
  console.log(`[*] - ${client.config.keyword} start.`);
});

client.on('groupMessage', async (message) => {
  if (message.isCommand) {
    return Promise.resolve();
  }

  const timestamp = Date.now();

  const unlock = await cache.lock(message.targetGroupId);

  try {
    const cached = await cache.getGame(message.targetGroupId);

    if (!cached) {
      return Promise.resolve();
    }

    return await messageHandler(client, message, cached, timestamp, cache);
  } finally {
    unlock();
  }
});

client.on('joinedGroup', async (group) => {
  await setLastActive(group.id);
});

client.on('leftGroup', async (group) => {
  await deleteGroup(group.id);
});

client.login(process.env.EMAIL, process.env.PASSWORD, OnlineState.ONLINE);

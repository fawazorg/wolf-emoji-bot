import dotenv from 'dotenv';
import EmojiClient from './EmojiClient.js';
dotenv.config();
import('./db.js');

const clients = new Map();
const accounts = process.env.ACCOUNTS.split('|');
const main = async () => {
  await accounts.reduce(async (previousValue, account) => {
    await previousValue;

    const client = new EmojiClient(account.split(':')[0], account.split(':')[1]);

    await client.commandRegister();

    clients.set(account.split(':')[0], client);
    await new Promise(resolve => setTimeout(resolve, 500));
  }, Promise.resolve());

  return Promise.resolve();
};

main().then().catch(e => console.log(e));

export default clients;

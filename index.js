import client from './bot.js';
import commands from './commands/index.js';

client.commandHandler.register([commands]);

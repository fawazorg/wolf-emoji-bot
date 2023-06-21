import { OnlineState, WOLF, Command } from 'wolf.js';
import { scheduleJob } from 'node-schedule';
import * as Emoji from './commands/index.js';
import { leaveInactiveGroups } from './emoji/jobs/group.js';
import { setLastActive, deleteGroup } from './emoji/active.js';
import cache from './emoji/cache.js';
import messageHandler from './emoji/solver.js';
import gameTimeout from './emoji/jobs/timeout.js';

class EmojiClient {
  constructor (email, password) {
    this.client = new WOLF();
    this.client.login(email, password, OnlineState.ONLINE);
    this.client.on('ready', async () => this._onReady());
    this.client.on('loginSuccess', async (subscriber) => this._onLoginSuccess(subscriber));
    this.client.on('groupMessage', async (message) => this._onGroupMessage(message));
    this.client.on('joinedGroup', async (group) => this._onJoinedGroup(group));
    this.client.on('leftGroup', (group) => this._onLeftGroup(group));
  }

  commandRegister = () => {
    this.client.commandHandler.register([
      // base command
      new Command('command_default', { both: command => Emoji.Main(this.client, command) }, [
        // help command
        new Command('command_help', { both: command => Emoji.Help(this.client, command) }),
        // next command
        new Command('command_next', { group: command => Emoji.Next(this.client, command) }),
        // join command
        new Command('command_join', { both: command => Emoji.Join(this.client, command) }),
        // deploy command
        new Command('command_deploy', { private: command => Emoji.Deploy(this.client, command) }),
        // status command
        new Command('command_status', { group: command => Emoji.Status(this.client, command) }),
        // global score command
        new Command('command_global_score', { group: command => Emoji.GlobalScore(this.client, command) }),
        // score command
        new Command('command_score', { group: command => Emoji.Score(this.client, command) }),
        // auto command
        new Command('command_auto', { group: command => Emoji.Auto(this.client, command) }),
        // admin commands
        new Command('command_admin_default', { group: command => Emoji.Admin.Main(this.client, command) }, [
          // add command
          new Command('command_admin_add', { group: command => Emoji.Admin.Add(this.client, command) }),
          // contact add command
          new Command('command_admin_contact_add', { group: command => Emoji.Admin.ContactAdd(this.client, command) }),
          // admin count command
          new Command('command_admin_count', { group: command => Emoji.Admin.Count(this.client, command) }),
          // delete command
          new Command('command_admin_delete', { group: command => Emoji.Admin.Delete(this.client, command) }),
          // help command
          new Command('command_admin_help', { group: command => Emoji.Admin.Help(this.client, command) }),
          // refresh command
          new Command('command_admin_refresh', { group: command => Emoji.Admin.Refresh(this.client, command) }),
          // solve command
          new Command('command_admin_solve', { group: command => Emoji.Admin.Solve(this.client, command) }),
          // stats command
          new Command('command_admin_stats', { group: command => Emoji.Admin.Stats(this.client, command) })
        ])
      ])
    ]);
  };

  async _onReady () {
    scheduleJob('0 * * * *', async () => await leaveInactiveGroups(this.client, 5));
    await this.client.utility.timer.register(
      {
        gameTimeout: (data) => gameTimeout(this.client, data, cache)
      }
    );
  }

  async _onGroupMessage (message) {
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

      return await messageHandler(this.client, message, cached, timestamp, cache);
    } finally {
      unlock();
    }
  }

  async groups () {
    const groups = await this.client.group.list();

    return groups;
  }

  async _onJoinedGroup (group) {
    await setLastActive(group.id);
  }

  async _onLeftGroup (group) {
    await deleteGroup(group.id);
  }

  _onLoginSuccess (subscriber) {
    console.log(`[*] ${this.client.config.keyword} (${subscriber.id}) start.`);
  }
}
export default EmojiClient;

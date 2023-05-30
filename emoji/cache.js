import Redis from 'ioredis';
import redisLock from 'redis-lock';
import { promisify } from 'util';
import { client } from '../bot.js';

const KEY_PREFIX = 'emoji.';
const GAME_PREFIX = 'game:';

class Cache {
  constructor () {
    const clonedConfig = JSON.parse(JSON.stringify(client.config));

    clonedConfig.retryStrategy = (times) => Math.min(times * 100, 3000);

    this._client = new Redis(clonedConfig);

    this.lock = promisify(redisLock(this._client));
  }

  _get (key) {
    return new Promise((resolve, reject) => {
      this._client.get(
        `${KEY_PREFIX}${key}`,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  _set (key, item, ttl) {
    // Item needs to expire
    if (ttl) {
      return new Promise((resolve, reject) => {
        this._client.set(
          `${KEY_PREFIX}${key}`,
          item,
          'EX',
          ttl,
          (error, results) => ((error) ? reject(error) : resolve(results))
        );
      });
    }

    return new Promise((resolve, reject) => {
      this._client.set(
        `${KEY_PREFIX}${key}`,
        item,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  _delete (key) {
    return new Promise((resolve, reject) => {
      this._client.del(
        `${KEY_PREFIX}${key}`,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  _exists (key) {
    return new Promise((resolve, reject) => {
      this._client.exists(
        `${KEY_PREFIX}${key}`,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  _expire (key, ttl) {
    return new Promise((resolve, reject) => {
      this._client.expire(
        `${KEY_PREFIX}${key}`,
        ttl,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  _ttl (key) {
    return new Promise((resolve, reject) => {
      this._client.ttl(
        `${KEY_PREFIX}${key}`,
        (error, results) => ((error) ? reject(error) : resolve(results))
      );
    });
  }

  async getGame (id) {
    return JSON.parse(await this._get(`${GAME_PREFIX}${id}`));
  }

  async setGame (id, value) {
    return await this._set(`${GAME_PREFIX}${id}`, JSON.stringify(value));
  }

  async deleteGame (id) {
    return await this._delete(`${GAME_PREFIX}${id}`);
  }
}

export default Cache;

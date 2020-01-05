import Redis from 'ioredis';

class Cache {
  constructor() {
    this.oneMinuteInSeconds = 60;
    this.oneHourInSeconds = 3600;

    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: 'cache:',
    });
  }

  set(key, value, time) {
    return this.redis.set(key, JSON.stringify(value), 'EX', time);
  }

  setInMinutes(key, value, minutes) {
    return this.set(key, value, this.oneMinuteInSeconds * minutes);
  }

  setInHours(key, value, hours) {
    return this.set(key, value, this.oneHourInSeconds * hours);
  }

  async get(key) {
    const cached = await this.redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  delete(key) {
    return this.redis.del(key);
  }

  async deletePrefix(prefix) {
    const keys = await this.redis.keys(`cache:${prefix}:*`);

    const keysWithoutPrefix = keys.map(key => key.replace('cache', ''));

    return this.redis.del(keysWithoutPrefix);
  }
}

export default new Cache();

import Redis from 'ioredis';

class RedisCache {
  constructor(redisUrl) {
    this.redis = new Redis(redisUrl);
  }

  async get(key) {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value) {
    await this.redis.set(key, JSON.stringify(value));
  }

  async del(key) {
    await this.redis.del(key);
  }

  /**
   * Method to keep lists sorted
   */
  insertObjectIntoSortedArray(sortedArray, object) {
    let index = 0;
    while (index < sortedArray.length && object.name > sortedArray[index].name) {
      index++;
    }
    sortedArray.splice(index, 0, object);

    return sortedArray;
  }
}

export default RedisCache;
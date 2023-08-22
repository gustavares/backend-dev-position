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
    const existingIndex = sortedArray.findIndex(item => item.id === object.id);
    if (existingIndex !== -1) {
      sortedArray[existingIndex] = object;
    } else {
      let index = 0;
      while (index < sortedArray.length && object.name > sortedArray[index].name) {
        index++;
      }
      sortedArray.splice(index, 0, object);
    }

    return sortedArray;
  }

  async removeSongFromPlaylist(userId, playlistId, songId) {
    const cachedUser = await this.get(`user:${userId}`);
    if (cachedUser && cachedUser.playlists) {
      const indexFound = cachedUser.playlists.findIndex(p => p.id === playlistId);
      if (indexFound !== -1) {
        const cachedPlaylistSongs = cachedUser.playlists[indexFound].songs || [];
        const updatedPlaylistSongs = cachedPlaylistSongs.filter(s => s.id !== songId);
        cachedUser.playlists[indexFound].songs = updatedPlaylistSongs;

        await this.set(`user:${userId}`, cachedUser);
      }
    }
  }

  async removeSongFromUser(userId, songId) {
    const cacheKey = `user:${userId}`;
    const cachedUser = await this.get(cacheKey);

    if (cachedUser && cachedUser.songs) {
      const songs = cachedUser.songs.filter(song => song.id !== songId);
      cachedUser.songs = songs;
      await this.set(cacheKey, cachedUser);
    }
  }
}

export default RedisCache;
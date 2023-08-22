import playlistOperations from '../data/playlist.mjs';
import songOperations from '../data/song.mjs';
import userOperations from '../data/user.mjs';
import { v4 as uuidv4 } from 'uuid';

const resolvers = {
  Query: {
    user: async (_, { id }, { redisCache }) => {
      const cachedUser = await redisCache.get(`user:${id}`);
      if (cachedUser) {
        return cachedUser;
      }

      const user = await userOperations.getUserById(id);
      await redisCache.set(`user:${id}`, user);

      return user;
    },
    songs: async (_, { userId }) => {
      return await songOperations.getSongsByUserId(userId);
    },
    playlists: async (_, { userId }) => {
      return await playlistOperations.getPlaylistsByUserIdOrderedByName(userId);
    }
  },
  User: {
    async name(parent) {
      if (parent.name) return parent.name;
      const user = await userOperations.getUserById(parent.id);
      return user.name;
    },
    async email(parent) {
      if (parent.email) return parent.email;
      const user = await userOperations.getUserById(parent.id);
      return user.email;
    },
    async playlists(parent, _, { redisCache }) {
      const playlists = await playlistOperations.getPlaylistsByUserIdOrderedByName(parent.id);
      const updatedUser = { ...parent, playlists };

      await redisCache.set(`user:${parent.id}`, updatedUser);

      return playlists;
    },
    async songs(parent, _, { redisCache }) {
      const songs = await songOperations.getSongsByUserId(parent.id);
      const updatedUser = { ...parent, songs };

      await redisCache.set(`user:${parent.id}`, updatedUser);

      return songs;
    },
  },
  Playlist: {
    async name(parent) {
      return await playlistOperations.getName(parent.id);
    },
    async songs(parent, _, { redisCache }) {
      const { user_id: userId } = parent;
      const songs = await playlistOperations.getSongs(parent.id);

      const updatedPlaylist = { ...parent, songs };
      const cachedUser = redisCache.get(`user:${userId}`) || { id: userId };
      cachedUser.playlists = redisCache.insertObjectIntoSortedArray(cachedUser.playlists || [], updatedPlaylist);
      await redisCache.set(`user:${userId}`, cachedUser);

      return songs
    }
  },
  Mutation: {
    createUser: async (_, { name, email }) => {
      return await userOperations.createUser(name, email);
    },
    updateUser: async (_, { id, input }, { redisCache }) => {
      const user = await userOperations.updateUser(id, input);

      if (user && 'email' in input) {
        await redisCache.del(`user:${id}`);
      }

      return user;
    },
    createPlaylist: async (_, { userId, name }) => {
      return await playlistOperations.createPlaylist(userId, name);
    },
    deletePlaylist: async (_, { id }) => {
      return await playlistOperations.deletePlaylist(id);
    },
    createSong: async (_, { userId, name }, { redisCache }) => {
      const cachedUser = await redisCache.get(`user:${userId}`) || { id: userId };
      const songId = uuidv4();
      const newSong = {
        id: songId,
        name
      };
      const songs = cachedUser.songs || [];
      cachedUser.songs = redisCache.insertObjectIntoSortedArray(songs, newSong);

      await redisCache.set(`user:${userId}`, cachedUser);
      return await songOperations.createSong(userId, name);
    },
    deleteSong: async (_, { id }) => {
      const [songToRemove] = await songOperations.getById(id);
      const cacheKey = `user:${song['user_id']}`;
      const cachedUser = await redisCache.get(cacheKey);
      if (cachedUser && cachedUser.songs) {
        const songs = cachedUser.songs.filter(song => song.id !== songToRemove.id);
        cachedUser.songs = songs;
        await redisCache.set(cacheKey, cachedUser);
      }
      return await songOperations.deleteSong(id);
    },
    addSongToPlaylist: async (_, { songId, playlistId }, { redisCache }) => {
      const [playlist] = await playlistOperations.getById(playlistId);
      const [song] = await songOperations.getById(songId);

      const userId = playlist['user_id'];
      const cachedUser = await redisCache.get(`user:${userId}`) || { id: userId };
      const cachedPlaylists = cachedUser.playlists || [];
      const indexFound = cachedPlaylists.findIndex(p => p.id === playlistId);

      if (indexFound !== -1) {
        const cachedPlaylistSongs = cachedPlaylists[indexFound].songs || [];
        cachedPlaylists[indexFound].songs = redisCache.insertObjectIntoSortedArray(cachedPlaylistSongs, song);
      } else {
        cachedPlaylists.push({
          ...playlist,
          songs: [song],
        });
      }

      cachedUser.playlists = cachedPlaylists;
      await redisCache.set(`user:${userId}`, cachedUser);
      return await playlistOperations.addSong(songId, playlistId);
    },
    removeSongFromPlaylist: async (_, { songId, playlistId }) => {
      return await playlistOperations.removeSong(songId, playlistId);
    },
  },
};



export default resolvers;

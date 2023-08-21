import playlistOperations from '../data/playlist.mjs';
import songOperations from '../data/song.mjs';
import userOperations from '../data/user.mjs';

const resolvers = {
  Query: {
    user: async (_, { id }) => {
      return await userOperations.getUserById(id);
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
    async playlists(parent) {
      return await playlistOperations.getPlaylistsByUserIdOrderedByName(parent.id)
    },
    async songs(parent) {
      return await songOperations.getSongsByUserId(parent.id)
    }
  },
  Playlist: {
    async name(parent) {
      return await playlistOperations.getName(parent.id);
    },
    async songs(parent) {
      return await playlistOperations.getSongs(parent.id)
    }
  },
  Mutation: {
    createUser: async (_, { name, email }) => {
      return await userOperations.createUser(name, email);
    },
    updateUser: async (_, { id, input }) => {
      return await userOperations.updateUser(id, input);
    },
    createPlaylist: async (_, { userId, name }) => {
      return await playlistOperations.createPlaylist(userId, name);
    },
    deletePlaylist: async (_, { id }) => {
      return await playlistOperations.deletePlaylist(id);
    },
    createSong: async (_, { userId, name }) => {
      return await songOperations.createSong(userId, name);
    },
    deleteSong: async (_, { id }) => {
      return await songOperations.deleteSong(id);
    },
    addSongToPlaylist: async (_, { songId, playlistId }) => {
      return await playlistOperations.addSong(songId, playlistId);
    },
    removeSongFromPlaylist: async (_, { songId, playlistId }) => {
      return await playlistOperations.removeSong(songId, playlistId);
    },
  },
};

export default resolvers;

import knex from '../lib/knex.js';

const playlistOperations = {
  getPlaylistsByUserIdOrderedByName: async (userId) => {
    return await knex('playlists').where({ 'user_id': userId }).orderBy('name', 'asc');
  },
  createPlaylist: async (userId, name) => {
    const [newPlaylist] = await knex('playlists')
      .returning('*')
      .insert({ 'user_id': userId, name });

    return newPlaylist;
  },
  deletePlaylist: async (playlistId) => {
    const deletedCount = await knex('playlists')
      .where({ id: playlistId })
      .del();

    return deletedCount > 0;
  }
};

export default playlistOperations;
import knex from '../lib/knex.js';

const playlistOperations = {
  getPlaylistsByUserIdOrderedByName: async (userId) => {
    return await knex('playlists').where({ 'user_id': userId }).orderBy('name', 'asc');
  },
};

export default playlistOperations;
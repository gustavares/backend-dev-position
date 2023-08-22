import knex from '../lib/knex.js';

const songOperations = {
  getById: async (id) => {
    return await knex('songs').where({ id });
  },
  getSongsByUserId: async (userId) => {
    return await knex('songs').where({ 'user_id': userId }).orderBy('name', 'asc');
  },
  createSong: async (userId, songId, name) => {
    const [newSong] = await knex('songs')
      .returning('*')
      .insert({ id: songId, name, 'user_id': userId });

    return newSong;
  },
  deleteSong: async (songId) => {
    const deletedCount = await knex('songs')
      .where({ id: songId })
      .del();

    return deletedCount > 0;
  }
};

export default songOperations;
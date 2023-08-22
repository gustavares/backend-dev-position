import knex from '../lib/knex.js';

const songOperations = {
  getSongsByUserId: async (userId) => {
    return await knex('songs').where({ 'user_id': userId }).orderBy('name', 'asc');
  },
  createSong: async (userId, name) => {
    const [newSong] = await knex('songs')
      .returning('*')
      .insert({ name, 'user_id': userId });

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
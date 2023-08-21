import knex from '../lib/knex.js';

const songOperations = {
  getSongsByUserId: async (userId) => {
    return await knex('songs').where({ 'user_id': userId });
  },
  getSongsByPlaylistId: async (playlistId) => {
    return await knex('playlist_songs')
      .select('songs.*')
      .join('songs', 'songs.id', 'playlist_songs.song_id')
      .where({ 'playlist_id ': playlistId })
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
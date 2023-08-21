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
  }
};

export default songOperations;
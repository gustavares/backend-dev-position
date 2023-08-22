import knex from '../lib/knex.js';

const playlistOperations = {
  getById: async (playlistId) => {
    return await knex('playlists').where({ 'id': playlistId });
  },
  getName: async (playlistId) => {
    const [{ name }] = await knex('playlists')
      .select('playlists.name')
      .where({ 'id': playlistId });
    return name;
  },
  getSongs: async (playlistId) => {
    return await knex('playlist_songs')
      .select('songs.*')
      .join('songs', 'songs.id', 'playlist_songs.song_id')
      .where({ 'playlist_id ': playlistId })
  },
  getPlaylistsByUserIdOrderedByName: async (userId) => {
    return await knex('playlists').where({ 'user_id': userId }).orderBy('name', 'asc');
  },
  getPlaylistIdsContainingSong: async (songId) => {
    return await knex('playlist_songs')
      .select('playlist_id')
      .where('song_id', songId)
      .distinct()
      .pluck('playlist_id');
  },
  createPlaylist: async (userId, name) => {
    const [newPlaylist] = await knex('playlists')
      .returning('*')
      .insert({ 'user_id': userId, name });

    return newPlaylist;
  },
  deletePlaylist: async (playlistId) => {
    await knex('playlist_songs')
      .where({ playlist_id: playlistId })
      .del();

    const deletedCount = await knex('playlists')
      .where({ id: playlistId })
      .del();

    return deletedCount > 0;
  },
  addSong: async (songId, playlistId) => {
    const [playlistSong] = await knex('playlist_songs')
      .returning('playlist_id')
      .insert({ playlist_id: playlistId, song_id: songId });

    return {
      id: playlistSong['playlist_id']
    };
  },
  removeSong: async (songId, playlistId) => {
    await knex('playlist_songs')
      .where({
        song_id: songId,
        playlist_id: playlistId,
      })
      .del();
    return {
      id: playlistId
    };
  }
};

export default playlistOperations;
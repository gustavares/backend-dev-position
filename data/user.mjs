import knex from '../lib/knex.js';

const userOperations = {
  getUserById: async (id) => {
    return await knex('users').where({ id }).first();
  },
  createUser: async (name, email) => {
    const [newUser] = await knex('users')
      .returning('*')
      .insert({ name, email });

    return newUser;
  },
  updateUser: async (id, input) => {
    await knex('users')
      .where('id', id)
      .update(input);

    return { id };
  },
};

export default userOperations;

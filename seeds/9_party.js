
exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return process.env.NODE_ENV === 'test'
    ? knex('party').del()
      .then(function () {
        // Inserts seed entries
        return knex('party').insert([
          { name: 'INC', avatar: 'inc.png', bio: 'Inner Circle' },
          { name: 'La La Lang', avatar: 'lang.png', bio: 'La La Land' }
        ])
      })
    : null
}

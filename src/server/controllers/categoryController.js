const { Category } = require('../models');

async function listCategories() {
  const cats = await Category.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] });
  return cats.map(c => c.get({ plain: true }));
}

module.exports = {
  listCategories
};
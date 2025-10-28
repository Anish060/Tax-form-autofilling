const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User')(sequelize);
const Document = require('./Document')(sequelize);
const TaxReturn = require('./TaxReturn')(sequelize);

// associations
User.hasMany(Document);
Document.belongsTo(User);

User.hasMany(TaxReturn);
TaxReturn.belongsTo(User);

Document.hasOne(TaxReturn);
TaxReturn.belongsTo(Document);

module.exports = {
  sequelize,
  User,
  Document,
  TaxReturn
};

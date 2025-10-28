const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  port: process.env.DB_PORT || 3306,
});

const db = { Sequelize, sequelize };

db.User = require('./user.model')(sequelize, Sequelize);
db.Document = require('./document.model')(sequelize, Sequelize);
db.TaxRecord = require('./tax_record.model')(sequelize, Sequelize);

// associations
db.User.hasMany(db.Document, { foreignKey: 'user_id' });
db.Document.belongsTo(db.User, { foreignKey: 'user_id' });

db.User.hasMany(db.TaxRecord, { foreignKey: 'user_id' });
db.TaxRecord.belongsTo(db.User, { foreignKey: 'user_id' });

module.exports = db;

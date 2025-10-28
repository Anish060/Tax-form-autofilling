const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Document', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: DataTypes.STRING },
    filepath: { type: DataTypes.STRING },
    ocrText: { type: DataTypes.TEXT('long') },
    extractedJson: { type: DataTypes.JSON }
  }, {
    tableName: 'documents',
    timestamps: true
  });
};

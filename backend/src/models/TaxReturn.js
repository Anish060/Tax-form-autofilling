const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TaxReturn', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assessmentYear: { type: DataTypes.STRING },
    regime: { type: DataTypes.STRING }, // old/new
    computedTax: { type: DataTypes.JSON }, // breakdown
    itrJson: { type: DataTypes.JSON }, // final JSON ready to submit / or ITR fields
    pdfPath: { type: DataTypes.STRING }
  }, {
    tableName: 'tax_returns',
    timestamps: true
  });
};

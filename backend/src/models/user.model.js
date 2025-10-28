module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    password_hash: { type: DataTypes.STRING },
    pan: { type: DataTypes.STRING },
    aadhaar: { type: DataTypes.STRING }
  }, {
    tableName: 'users',
    timestamps: false
  });
  return User;
};

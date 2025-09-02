const { DataTypes } = require("sequelize");

const payment_config = (sequelize) => {
  const model = sequelize.define(
    "payment_config",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payment_type: {
        // payment gateway id
        type: DataTypes.INTEGER,
      },
      merchant_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      merchant_secret: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      callback_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fee: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "payment_config", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = payment_config;

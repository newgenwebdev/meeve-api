const { DataTypes } = require("sequelize");

const payment_gateway = (sequelize) => {
  const model = sequelize.define(
    "payment_gateway",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "payment_gateway", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = payment_gateway;

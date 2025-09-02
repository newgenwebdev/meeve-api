const { DataTypes } = require("sequelize");

const delivery_courier_list = (sequelize) => {
  const model = sequelize.define(
    "delivery_courier_list",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courier_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      api_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      secret_key: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "delivery_courier_list", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = delivery_courier_list;

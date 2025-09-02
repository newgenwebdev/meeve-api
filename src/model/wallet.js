const { DataTypes } = require("sequelize");

const wallet = (sequelize) => {
  const model = sequelize.define(
    "wallet",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        // to indicate wallet type eg: points, bonus, by country wallet
        type: DataTypes.INTEGER,
        default: 0,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "wallet", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = wallet;

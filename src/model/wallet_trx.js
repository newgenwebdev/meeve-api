const { DataTypes } = require("sequelize");

const wallet_trx = (sequelize) => {
  const model = sequelize.define(
    "wallet_trx",
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
      trx_amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      wallet_open_balance: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      wallet_close_balance: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING,
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
      tableName: "wallet_trx", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = wallet_trx;

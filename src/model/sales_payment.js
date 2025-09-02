const { DataTypes } = require("sequelize");

const sales_payment = (sequelize) => {
  const model = sequelize.define(
    "sales_payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "MYR",
      },
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // 0 = pending, 1 = success, 2 = failed
      },
      customer_email: {
        type: DataTypes.STRING,
      },
      customer_name: {
        type: DataTypes.STRING,
      },
      payment_method: {
        type: DataTypes.STRING,
      },
      payment_gateway: {
        type: DataTypes.STRING,
      },
      gateway_payment_id: {
        type: DataTypes.STRING,
      },
      gateway_transaction_id: {
        type: DataTypes.STRING,
      },
      gateway_response: {
        type: DataTypes.TEXT,
      },
      paid_at: {
        type: DataTypes.DATE,
      },
      description: {
        type: DataTypes.TEXT,
      },
      metadata: {
        type: DataTypes.TEXT,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true,
      tableName: "sales_payment",
    }
  );

  return model;
};

module.exports = sales_payment; 
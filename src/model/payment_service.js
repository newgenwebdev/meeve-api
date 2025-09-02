const { DataTypes } = require("sequelize");

const payment_service = (sequelize) => {
  const model = sequelize.define(
    "payment_service",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      state: {
        // init or paid
        type: DataTypes.STRING,
      },
      transaction_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      transaction_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transaction_date_created: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      order_amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      payment_type: {
        // payment gateway id
        type: DataTypes.INTEGER,
      },
      payment_mode: {
        // CC, bank and etc
        type: DataTypes.STRING,
        allowNull: true,
      },
      currency: {
        // MYR
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      member_name: {
        type: DataTypes.STRING,
      },
      member_email: {
        type: DataTypes.STRING,
      },
      member_contact: {
        type: DataTypes.BIGINT,
      },
      expired_date: {
        // use to do cronjob checking
        type: DataTypes.DATE,
      },
      payment_response: {
        type: DataTypes.JSON,
      },
      clientIp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "payment_service", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = payment_service;

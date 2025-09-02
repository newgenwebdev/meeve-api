const { DataTypes } = require("sequelize");

const sales_order = (sequelize) => {
  const model = sequelize.define(
    "sales_order",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
      },
      product_detail: {
        type: DataTypes.JSON,
      },
      order_status: {
        type: DataTypes.INTEGER,
      },
      payment_status: {
        type: DataTypes.INTEGER,
      },
      delivery_status: {
        type: DataTypes.INTEGER,
      },
      payment_option: {
        // pay by which method
        type: DataTypes.INTEGER,
      },
      payment_type: {
        // payment gateway id
        type: DataTypes.INTEGER,
      },
      delivery_fee: {
        type: DataTypes.DOUBLE,
      },
      payment_gateway_fee: {
        type: DataTypes.DOUBLE,
      },
      voucher_code: {
        type: DataTypes.STRING,
      },
      total_weight: {
        type: DataTypes.DOUBLE,
      },
      paid_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      order_amount: {
        type: DataTypes.DOUBLE,
      },
      total_amount: {
        type: DataTypes.DOUBLE,
      },
      total_point: {
        type: DataTypes.DOUBLE,
      },
      shipping_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shipping_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      member_details: {
        type: DataTypes.JSON,
        defaultValue: false,
      },
      merchant_order_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shipping_details: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "sales_order", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = sales_order;

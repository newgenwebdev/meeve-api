const { DataTypes } = require("sequelize");

const sales_product = (sequelize) => {
  const model = sequelize.define(
    "sales_product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      desc: {
        type: DataTypes.STRING,
      },
      weight: {
        type: DataTypes.DOUBLE,
      },
      price: {
        type: DataTypes.DOUBLE,
      },
      point: {
        type: DataTypes.DOUBLE,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      product_img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      product_sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      product_category: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "sales_product", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = sales_product;

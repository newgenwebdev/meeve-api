const { DataTypes } = require("sequelize");

const sales_package = (sequelize) => {
  const model = sequelize.define(
    "sales_package",
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
      quantity: {
        type: DataTypes.INTEGER,
      },
      package_img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      package_sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      package_ids: {
        type: DataTypes.JSON,
        allowNull: true,
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
      tableName: "sales_package", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = sales_package;

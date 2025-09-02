const { DataTypes } = require("sequelize");

const delivery_error_log = (sequelize) => {
  const model = sequelize.define(
    "delivery_error_log",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        // api path and etc...
        type: DataTypes.STRING,
        allowNull: false,
      },
      log_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      input_param: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      output_param: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "delivery_error_log", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = delivery_error_log;

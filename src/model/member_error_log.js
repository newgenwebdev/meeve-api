const { DataTypes } = require("sequelize");

const member_error_log = (sequelize) => {
  const model = sequelize.define(
    "member_error_log",
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
        allowNull: true,
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
      tableName: "member_error_log", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = member_error_log;

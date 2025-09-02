const { DataTypes } = require("sequelize");

const workout_error_log = (sequelize) => {
  const model = sequelize.define(
    "workout_error_log",
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
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSON,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "workout_error_log", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = workout_error_log; 
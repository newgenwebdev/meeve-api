const { DataTypes } = require("sequelize");

const workout_audit_log = (sequelize) => {
  const model = sequelize.define(
    "workout_audit_log",
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
      update_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      input_param: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      output_param: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "workout_audit_log", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = workout_audit_log; 
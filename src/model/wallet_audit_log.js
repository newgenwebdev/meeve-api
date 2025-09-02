const { DataTypes } = require("sequelize");

const wallet_audit_log = (sequelize) => {
  const model = sequelize.define(
    "wallet_audit_log",
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
      tableName: "wallet_audit_log", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = wallet_audit_log;

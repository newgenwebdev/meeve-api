const { DataTypes } = require("sequelize");

const blog_audit_log = (sequelize) => {
  const model = sequelize.define(
    "blog_audit_log",
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
      tableName: "blog_audit_log", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = blog_audit_log;

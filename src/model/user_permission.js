const { DataTypes } = require("sequelize");

const user_permission = (sequelize) => {
  const model = sequelize.define(
    "user_permission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
      },
      permission_id: {
        type: DataTypes.INTEGER,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "user_permission", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = user_permission;

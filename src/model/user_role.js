const { DataTypes } = require("sequelize");

const user_role = (sequelize) => {
  const model = sequelize.define(
    "user_role",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "user_role", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = user_role;

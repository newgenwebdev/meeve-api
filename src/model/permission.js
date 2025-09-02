const { DataTypes } = require("sequelize");

const permission = (sequelize) => {
  const model = sequelize.define(
    "permission",
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
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      member_id: {
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
      tableName: "permission", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = permission;

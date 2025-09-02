const { DataTypes } = require("sequelize");

const banner = (sequelize) => {
  const model = sequelize.define(
    "banner",
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
      img_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      redirect_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sequence_id: {
        type: DataTypes.INTEGER,
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
      tableName: "banner", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = banner;

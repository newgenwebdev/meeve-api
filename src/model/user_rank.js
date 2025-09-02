const { DataTypes } = require("sequelize");

const user_rank = (sequelize) => {
  const model = sequelize.define(
    "user_rank",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      rate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      point_per_spent: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      rank_up_criteria: {
        type: DataTypes.DOUBLE,
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
      tableName: "user_rank", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = user_rank;

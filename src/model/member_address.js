const { DataTypes } = require("sequelize");

const member_address = (sequelize) => {
  const model = sequelize.define(
    "member_address",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address_1: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      address_2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      postcode: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "member_address", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = member_address;

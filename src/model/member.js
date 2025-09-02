const { DataTypes } = require("sequelize");

const member = (sequelize) => {
  const model = sequelize.define(
    "member",
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
      username: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true, // Ensures not an empty string
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [6, 100], // Ensures the password length is between 6 and 100 characters
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_no: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      member_rank_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      total_spend_amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      login_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      token_last_access_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      token_login_status: {
        // logout set to false
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "member", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = member;

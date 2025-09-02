const { DataTypes } = require("sequelize");

const voucher = (sequelize) => {
  const model = sequelize.define(
    "voucher",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        // voucher name
        type: DataTypes.STRING,
      },
      prefix: {
        type: DataTypes.STRING,
      },
      code: {
        // code is to use when checkout
        type: DataTypes.STRING,
      },
      desc: {
        type: DataTypes.STRING,
      },
      assigned_member_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      assigned_rank_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      exp_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      percentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      discount_type: {
        type: DataTypes.STRING,
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
      tableName: "voucher"// Explicitly set the table name
    }
  );

  return model;
};

module.exports = voucher;

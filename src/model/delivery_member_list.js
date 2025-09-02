const { DataTypes } = require("sequelize");

const delivery_member_list = (sequelize) => {
  const model = sequelize.define(
    "delivery_member_list",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
      },
      courier_id: {
        type: DataTypes.INTEGER,
      },
      member_id: {
        type: DataTypes.INTEGER,
      },
      parcel_weight: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      parcel_length: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      parcel_width: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      parcel_height: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      parcel_desc: {
        type: DataTypes.STRING,
      },
      parcel_value: {
        type: DataTypes.DOUBLE,
      },
      date_collect: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      courier_response: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      // aaaaaaaaaaaaaaaaa
      sender_company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sender_name: {
        type: DataTypes.STRING,
      },
      sender_contact: {
        type: DataTypes.INTEGER,
      },
      sender_email: {
        type: DataTypes.STRING,
      },
      sender_add_1: {
        type: DataTypes.STRING,
      },
      sender_add_2: {
        type: DataTypes.STRING,
      },
      sender_add_3: {
        type: DataTypes.STRING,
      },
      sender_country: {
        type: DataTypes.STRING,
      },
      sender_state: {
        type: DataTypes.STRING,
      },
      sender_city: {
        type: DataTypes.STRING,
      },
      sender_postcode: {
        type: DataTypes.INTEGER,
      },
      // sssssssssssssssssssss
      receiver_company: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receiver_name: {
        type: DataTypes.STRING,
      },
      receiver_contact: {
        type: DataTypes.INTEGER,
      },
      receiver_email: {
        type: DataTypes.STRING,
      },
      receiver_add_1: {
        type: DataTypes.STRING,
      },
      receiver_add_2: {
        type: DataTypes.STRING,
      },
      receiver_add_3: {
        type: DataTypes.STRING,
      },
      receiver_country: {
        type: DataTypes.STRING,
      },
      receiver_state: {
        type: DataTypes.STRING,
      },
      receiver_city: {
        type: DataTypes.STRING,
      },
      receiver_postcode: {
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
      tableName: "delivery_member_list", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = delivery_member_list;

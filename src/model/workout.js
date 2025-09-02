const { DataTypes, Sequelize } = require("sequelize");

const workout = (sequelize) => {
  const model = sequelize.define(
    "workout",
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
      content_type: {
        // WorkoutProgram , membership only program
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      program_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categories: {
        type: DataTypes.JSON, //TODO: MYSQL dont support arraytype
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON, //TODO: MYSQL dont support arraytype
        allowNull: true,
      },
      featured_image: {
        //URL for featured image
        type: DataTypes.STRING,
        allowNull: true,
      },
      featured_image_alt: {
        //description for featured image
        type: DataTypes.STRING,
        allowNull: true,
      },
      featured_video: {
        //URL for featured video
        type: DataTypes.STRING,
        allowNull: true,
      },
      featured_video_alt: {
        //description for featured video
        type: DataTypes.STRING,
        allowNull: true,
      },
      body: {
        //escaped string of html body
        type: DataTypes.TEXT,
        allowNull: false,
      },
      summary: {
        type: DataTypes.STRING,
      },
      seo_title: {
        type: DataTypes.STRING,
      },
      meta_description: {
        type: DataTypes.STRING,
      },
      set_invalid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "workout", // Explicitly set the table name
    }
  );

  return model;
};

module.exports = workout; 
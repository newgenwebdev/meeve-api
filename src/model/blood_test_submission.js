const { DataTypes } = require("sequelize");

const blood_test_submission = (sequelize) => {
  const model = sequelize.define(
    "blood_test_submission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'member',
          key: 'id'
        }
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_key: {
        // S3 key for the file
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      file_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      submission_status: {
        // pending, approved, rejected, under_review
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'under_review'),
        defaultValue: 'pending',
        allowNull: false,
      },
      reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'member',
          key: 'id'
        }
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      review_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      upload_ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        // Store additional file metadata as JSON
        type: DataTypes.JSON,
        allowNull: true,
      },
      fbg_value: {
        // Fasting Blood Glucose value in mg/dL
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Fasting Blood Glucose value in mg/dL for diabetes monitoring'
      },
      hba1c_value: {
        // HbA1C value in percentage
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'HbA1C value in percentage for diabetes monitoring'
      },
      diabetes_assessment: {
        // Assessment based on FBG and HbA1C values: normal, prediabetes, diabetes
        type: DataTypes.ENUM('normal', 'prediabetes', 'diabetes', 'not_assessed'),
        defaultValue: 'not_assessed',
        allowNull: false
      },
      values_extracted_by: {
        // ID of the admin/health professional who extracted the values
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'member',
          key: 'id'
        }
      },
      values_extracted_at: {
        // When the values were extracted from the report
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      // Sequelize options
      timestamps: true, // Adds 'createdAt' and 'updatedAt' fields
      tableName: "blood_test_submission", // Explicitly set the table name
      indexes: [
        {
          fields: ['member_id']
        },
        {
          fields: ['submission_status']
        },
        {
          fields: ['reviewed_by']
        },
        {
          fields: ['createdAt']
        },
        {
          fields: ['diabetes_assessment']
        },
        {
          fields: ['values_extracted_by']
        },
        {
          fields: ['fbg_value']
        },
        {
          fields: ['hba1c_value']
        }
      ]
    }
  );

  return model;
};

module.exports = blood_test_submission; 
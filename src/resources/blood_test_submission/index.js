const {
  success_JSON,
  fail_JSON,
  unauthorized_action,
} = require("../../helper/helper");
const model = require("../../model");
const AWS = require('aws-sdk');
const multer = require('multer');
const { Op } = require("sequelize");

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

// File validation helper for blood test files
const validateBloodTestFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];
  const maxSize = 20 * 1024 * 1024; // 20MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only PDF, images (JPG, PNG, GIF), and Word documents are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 20MB.');
  }
};

// Upload blood test file to S3 and save to database
const upload_blood_test_file = async (req, res) => {
  try {
    const file = req.file;
    const { userId } = req.body; // Get userId from request body
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

    if (!file) {
      return res.json(fail_JSON('NO_FILE_PROVIDED', 'No file provided'));
    }

    if (!userId) {
      return res.json(fail_JSON('NO_USER_ID', 'User ID is required'));
    }

    // Validate file
    validateBloodTestFile(file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Set S3 parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `blood-tests/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
      Metadata: {
        'uploaded-by': userId?.toString() || 'system',
        'upload-timestamp': timestamp.toString(),
        'original-filename': file.originalname
      }
    };
    
    // Upload to S3
    const s3Response = await s3.upload(params).promise();
    
    // Save submission to database
    const { blood_test_submission } = await model();
    
    const submissionData = {
      member_id: parseInt(userId),
      file_name: file.originalname,
      file_url: s3Response.Location,
      file_key: s3Response.Key,
      file_size: file.size,
      file_type: file.mimetype,
      submission_status: 'pending',
      upload_ip: clientIp,
      metadata: {
        originalName: file.originalname,
        s3Bucket: s3Response.Bucket,
        s3ETag: s3Response.ETag,
        uploadTimestamp: timestamp
      }
    };
    
    const submission = await blood_test_submission.create(submissionData);
    
    // Return success response with submission details
    const responseData = {
      id: submission.id,
      fileName: submission.file_name,
      fileUrl: submission.file_url,
      status: submission.submission_status,
      uploadDate: submission.createdAt,
      fileSize: submission.file_size,
      fileType: submission.file_type
    };
    
    res.json(success_JSON(responseData, 'Blood test file uploaded successfully'));
  } catch (error) {
    console.error('Blood test upload error:', error);
    res.json(fail_JSON('UPLOAD_FAILED', error.message || 'Failed to upload blood test file'));
  }
};

// Get user's blood test submissions
const get_user_submissions = async (userId, page = 1, limit = 10) => {
  try {
    const { blood_test_submission, member } = await model();
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await blood_test_submission.findAndCountAll({
      where: { member_id: userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: [
        'id',
        'file_name',
        'file_url',
        'file_size',
        'file_type',
        'submission_status',
        'reviewed_at',
        'review_notes',
        'fbg_value',
        'hba1c_value',
        'diabetes_assessment',
        'createdAt',
        'updatedAt'
      ]
    });
    
    const submissions = rows.map(submission => ({
      id: submission.id,
      fileName: submission.file_name,
      fileUrl: submission.file_url,
      fileSize: submission.file_size,
      fileType: submission.file_type,
      status: submission.submission_status,
      uploadDate: submission.createdAt,
      reviewedAt: submission.reviewed_at,
      reviewNotes: submission.review_notes,
      fbgValue: submission.fbg_value,
      hba1cValue: submission.hba1c_value,
      diabetesAssessment: submission.diabetes_assessment
    }));
    
    return success_JSON({
      submissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return fail_JSON('FETCH_FAILED', 'Failed to fetch submissions');
  }
};

// Get all submissions for admin (with pagination and filters)
const get_all_submissions = async (req) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      search,
      startDate,
      endDate,
      diabetesAssessment
    } = req.query;
    
    const { blood_test_submission, member } = await model();
    
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = {};
    
    if (status) {
      whereConditions.submission_status = status;
    }
    
    if (diabetesAssessment && diabetesAssessment !== 'all') {
      whereConditions.diabetes_assessment = diabetesAssessment;
    }
    
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Search in file name
    if (search) {
      whereConditions.file_name = {
        [Op.like]: `%${search}%`
      };
    }
    
    const { count, rows } = await blood_test_submission.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: member,
          attributes: ['id', 'username', 'email', 'first_name', 'last_name'],
          required: true
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    return success_JSON({
      submissions: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    return fail_JSON('FETCH_FAILED', 'Failed to fetch submissions');
  }
};

// Calculate diabetes assessment based on FBG and HbA1C values
const calculateDiabetesAssessment = (fbgValue, hba1cValue) => {
  // ADA (American Diabetes Association) criteria
  let fbgAssessment = 'normal';
  let hba1cAssessment = 'normal';
  
  if (fbgValue !== null && fbgValue !== undefined) {
    if (fbgValue >= 126) {
      fbgAssessment = 'diabetes';
    } else if (fbgValue >= 100) {
      fbgAssessment = 'prediabetes';
    }
  }
  
  if (hba1cValue !== null && hba1cValue !== undefined) {
    if (hba1cValue >= 6.5) {
      hba1cAssessment = 'diabetes';
    } else if (hba1cValue >= 5.7) {
      hba1cAssessment = 'prediabetes';
    }
  }
  
  // Return the higher risk assessment
  if (fbgAssessment === 'diabetes' || hba1cAssessment === 'diabetes') {
    return 'diabetes';
  } else if (fbgAssessment === 'prediabetes' || hba1cAssessment === 'prediabetes') {
    return 'prediabetes';
  }
  
  return 'normal';
};

// Update submission status (approve/reject)
const update_submission_status = async (req) => {
  try {
    const { submissionId } = req.params;
    const { status, reviewNotes } = req.body;
    const reviewerId = req.secret?.id;
    
    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return fail_JSON('INVALID_STATUS', 'Invalid status. Must be approved, rejected, or under_review');
    }
    
    const { blood_test_submission } = await model();
    
    const submission = await blood_test_submission.findByPk(submissionId);
    
    if (!submission) {
      return fail_JSON('SUBMISSION_NOT_FOUND', 'Submission not found');
    }
    
    const updateData = {
      submission_status: status,
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
      review_notes: reviewNotes || null
    };
    
    await submission.update(updateData);
    
    return success_JSON(submission, `Submission ${status} successfully`);
  } catch (error) {
    console.error('Error updating submission status:', error);
    return fail_JSON('UPDATE_FAILED', 'Failed to update submission status');
  }
};

// Update diabetes values for a submission (admin only)
const update_diabetes_values = async (req) => {
  try {
    const { submissionId } = req.params;
    const { fbgValue, hba1cValue } = req.body;
    const extractedById = req.secret?.id;
    
    const { blood_test_submission } = await model();
    
    const submission = await blood_test_submission.findByPk(submissionId);
    
    if (!submission) {
      return fail_JSON('SUBMISSION_NOT_FOUND', 'Submission not found');
    }
    
    // Validate values
    if (fbgValue && (fbgValue < 0 || fbgValue > 1000)) {
      return fail_JSON('INVALID_FBG', 'FBG value must be between 0 and 1000 mg/dL');
    }
    
    if (hba1cValue && (hba1cValue < 0 || hba1cValue > 20)) {
      return fail_JSON('INVALID_HBA1C', 'HbA1C value must be between 0 and 20%');
    }
    
    // Calculate diabetes assessment
    const diabetesAssessment = calculateDiabetesAssessment(fbgValue, hba1cValue);
    
    const updateData = {
      fbg_value: fbgValue || null,
      hba1c_value: hba1cValue || null,
      diabetes_assessment: diabetesAssessment,
      values_extracted_by: extractedById,
      values_extracted_at: new Date()
    };
    
    await submission.update(updateData);
    
    return success_JSON({
      ...submission.toJSON(),
      ...updateData
    }, 'Diabetes values updated successfully');
  } catch (error) {
    console.error('Error updating diabetes values:', error);
    return fail_JSON('UPDATE_FAILED', 'Failed to update diabetes values');
  }
};

// Get diabetes statistics for admin dashboard
const get_diabetes_statistics = async (req) => {
  try {
    const { startDate, endDate } = req.query;
    const { blood_test_submission } = await model();
    
    const whereConditions = {
      diabetes_assessment: {
        [Op.ne]: 'not_assessed'
      }
    };
    
    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    const [totalAssessed, normalCount, prediabetesCount, diabetesCount] = await Promise.all([
      blood_test_submission.count({ where: whereConditions }),
      blood_test_submission.count({ 
        where: { ...whereConditions, diabetes_assessment: 'normal' }
      }),
      blood_test_submission.count({ 
        where: { ...whereConditions, diabetes_assessment: 'prediabetes' }
      }),
      blood_test_submission.count({ 
        where: { ...whereConditions, diabetes_assessment: 'diabetes' }
      })
    ]);
    
    const statistics = {
      totalAssessed,
      normal: {
        count: normalCount,
        percentage: totalAssessed > 0 ? (normalCount / totalAssessed * 100).toFixed(1) : 0
      },
      prediabetes: {
        count: prediabetesCount,
        percentage: totalAssessed > 0 ? (prediabetesCount / totalAssessed * 100).toFixed(1) : 0
      },
      diabetes: {
        count: diabetesCount,
        percentage: totalAssessed > 0 ? (diabetesCount / totalAssessed * 100).toFixed(1) : 0
      }
    };
    
    return success_JSON(statistics);
  } catch (error) {
    console.error('Error fetching diabetes statistics:', error);
    return fail_JSON('FETCH_FAILED', 'Failed to fetch diabetes statistics');
  }
};

// Get signed URL for file access (for private S3 buckets)
const get_file_signed_url = async (req) => {
  try {
    const { submissionId } = req.params;
    const userId = req.secret?.id;
    
    const { blood_test_submission } = await model();
    
    const submission = await blood_test_submission.findByPk(submissionId);
    
    if (!submission) {
      return fail_JSON('SUBMISSION_NOT_FOUND', 'Submission not found');
    }
    
    // Check if user owns this submission or is an admin
    if (submission.member_id !== userId && !req.secret?.isAdmin) {
      return fail_JSON('UNAUTHORIZED', 'Not authorized to access this file');
    }
    
    // Generate signed URL (valid for 1 hour)
    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: submission.file_key,
      Expires: 3600 // 1 hour
    });
    
    return success_JSON({ 
      signedUrl,
      fileName: submission.file_name,
      fileType: submission.file_type
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return fail_JSON('URL_GENERATION_FAILED', 'Failed to generate file URL');
  }
};

// Delete submission (admin only)
const delete_submission = async (req) => {
  try {
    const { submissionId } = req.params;
    
    const { blood_test_submission } = await model();
    
    const submission = await blood_test_submission.findByPk(submissionId);
    
    if (!submission) {
      return fail_JSON('SUBMISSION_NOT_FOUND', 'Submission not found');
    }
    
    // Delete file from S3
    try {
      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: submission.file_key
      }).promise();
    } catch (s3Error) {
      console.error('Error deleting file from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }
    
    // Delete submission from database
    await submission.destroy();
    
    return success_JSON(null, 'Submission deleted successfully');
  } catch (error) {
    console.error('Error deleting submission:', error);
    return fail_JSON('DELETE_FAILED', 'Failed to delete submission');
  }
};

module.exports = {
  upload_blood_test_file,
  get_user_submissions,
  get_all_submissions,
  update_submission_status,
  update_diabetes_values,
  get_diabetes_statistics,
  get_file_signed_url,
  delete_submission
}; 
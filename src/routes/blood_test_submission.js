const express = require("express");
const router = express.Router();
const multer = require('multer');
const { fail_JSON } = require("../helper/helper");
const {
  upload_blood_test_file,
  get_user_submissions,
  get_all_submissions,
  update_submission_status,
  update_diabetes_values,
  get_diabetes_statistics,
  get_file_signed_url,
  delete_submission
} = require("../resources/blood_test_submission");

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  }
});

// Upload blood test file
router.post("/upload", upload.single('file'), async (req, res) => {
  try {
    await upload_blood_test_file(req, res);
  } catch (error) {
    console.log("err upload blood test file", error);
    res.status(500).json(fail_JSON("upload blood test file fail", error.message));
  }
});

// Get user's submissions
router.get("/my-submissions", async (req, res) => {
  try {
    const userId = req.secret?.id;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.json(fail_JSON("UNAUTHORIZED", "Please login to view submissions"));
    }
    
    const result = await get_user_submissions(userId, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.log("err get user submissions", error);
    res.json(fail_JSON("get user submissions fail", error.message));
  }
});

// Get all submissions (admin only)
router.get("/admin/all", async (req, res) => {
  try {
    // TODO: Add admin role check when role system is implemented
    // if (!req.secret?.isAdmin) {
    //   return res.json(fail_JSON("UNAUTHORIZED", "Admin access required"));
    // }
    
    const result = await get_all_submissions(req);
    res.json(result);
  } catch (error) {
    console.log("err get all submissions", error);
    res.json(fail_JSON("get all submissions fail", error.message));
  }
});

// Update submission status (admin only)
router.patch("/admin/:submissionId/status", async (req, res) => {
  try {
    // TODO: Add admin role check when role system is implemented
    // if (!req.secret?.isAdmin) {
    //   return res.json(fail_JSON("UNAUTHORIZED", "Admin access required"));
    // }
    
    const result = await update_submission_status(req);
    res.json(result);
  } catch (error) {
    console.log("err update submission status", error);
    res.json(fail_JSON("update submission status fail", error.message));
  }
});

// Update diabetes values (admin only)
router.patch("/admin/:submissionId/diabetes-values", async (req, res) => {
  try {
    // TODO: Add admin role check when role system is implemented
    // if (!req.secret?.isAdmin) {
    //   return res.json(fail_JSON("UNAUTHORIZED", "Admin access required"));
    // }
    
    const result = await update_diabetes_values(req);
    res.json(result);
  } catch (error) {
    console.log("err update diabetes values", error);
    res.json(fail_JSON("update diabetes values fail", error.message));
  }
});

// Get diabetes statistics (admin only)
router.get("/admin/diabetes-statistics", async (req, res) => {
  try {
    // TODO: Add admin role check when role system is implemented
    // if (!req.secret?.isAdmin) {
    //   return res.json(fail_JSON("UNAUTHORIZED", "Admin access required"));
    // }
    
    const result = await get_diabetes_statistics(req);
    res.json(result);
  } catch (error) {
    console.log("err get diabetes statistics", error);
    res.json(fail_JSON("get diabetes statistics fail", error.message));
  }
});

// Get signed URL for file access
router.get("/:submissionId/file-url", async (req, res) => {
  try {
    const result = await get_file_signed_url(req);
    res.json(result);
  } catch (error) {
    console.log("err get file signed url", error);
    res.json(fail_JSON("get file signed url fail", error.message));
  }
});

// Delete submission (admin only)
router.delete("/admin/:submissionId", async (req, res) => {
  try {
    // TODO: Add admin role check when role system is implemented
    // if (!req.secret?.isAdmin) {
    //   return res.json(fail_JSON("UNAUTHORIZED", "Admin access required"));
    // }
    
    const result = await delete_submission(req);
    res.json(result);
  } catch (error) {
    console.log("err delete submission", error);
    res.json(fail_JSON("delete submission fail", error.message));
  }
});

module.exports = router; 
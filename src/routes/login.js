const express = require("express");
const {
  login,
  handle_token,
  verify_token,
  logout,
  generate_token,
  forgot_password,
  reset_password,
} = require("../resources/login");
const router = express.Router();
const { fail_JSON, success_JSON } = require("../helper/helper");
const { OAuth2Client } = require('google-auth-library');
const { create_member, get_member_by_email } = require('../resources/member');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login route call handle_token
router.post("/login", async (req, res) => {
  const result = await login(req.body);
  req.body.user_id = result.data.id;
  if (result?.code === 200) {
    await handle_token(req, res, result.data.id);
  }
  res.json(result);
});

// verify route call verify_token
router.get("/verify", async (req, res) => {
  const result = await verify_token(req, res);
  // console.log("result", result);
  res.json(result);
});

router.post("/logout", async (req, res) => {
  const result = await logout(req, res);

  res.json(result);
});

// Google authentication
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    // Check if user exists
    let member = await get_member_by_email(payload.email);
    
    if (!member) {
      // Create new member with Google data
      const result = await create_member({
        googleData: payload,
      });
      
      if (result.code !== 200) {
        throw new Error(result.message || 'Failed to create member');
      }
      
      member = result.data;
    }
    
    // Generate JWT token
    const token = generate_token(member);
    
    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Return user data
    res.json({
      code: 200,
      data: member
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({
      code: 401,
      message: 'Authentication failed'
    });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const result = await forgot_password(email);
  res.json(result);
});

// Reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  const result = await reset_password(token, newPassword);
  res.json(result);
});

module.exports = router;

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const moment = require("moment");
const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");
const { member_error_log } = require("../audit_log");
const { get_member } = require("../member");
const { password_encryption } = require("../../helper/helper");
const { sendPasswordResetEmail } = require("../../services/emailService");


const attributes = [
  "id",
  "name",
  "username",
  "email",
  "contact_no",
  "role_id",
  "member_rank_id",
  "total_spend_amount",
];

// for login routes to attach at cookies and update db token and lass access
const handle_token = async (req, res, id) => {
  const { member } = await model();
  const token = crypto.randomBytes(16).toString("hex");
  const domain = req.hostname; // Gets the domain from the request
  console.log("domain", domain);
  await member.update(
    { login_token: token, token_last_access_time: moment() },
    {
      where: { id: id },
    }
  );

  // Set the token as an HTTP-only cookie (to prevent XSS attacks)
  res.cookie("token", token, {
    domain: domain, // cookie domain, only send cookie to requested domain
    httpOnly: true,
    secure: true, // make the cookie inaccessible to JavaScript on the client
    maxAge: 24 * 60 * 60 * 1000, // Token expires in 24 hours
    sameSite: "none",
  });

  return token; // Return token for further use
};

const get_member_info_by_token = async (req, res, token) => {
  const { member } = await model();

  const existingMember = await member.findOne({
    where: { login_token: token, set_invalid: false },
  });

  if (!existingMember) {
    // res.clearCookie("token", {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   domain: req.hostname, // optional, use if you set it when creating the cookie
    // });

    return fail_JSON("Invalid login token", "Invalid login token");
  }

  return existingMember;
};

// Verify token and update last access time
const verify_token = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {

    return fail_JSON("No login token provided", "No login token provided");
  }
  const { member } = await model();
  const existingMember = await member.findOne({
    where: { login_token: token },
  });

  if (!existingMember) {
    return fail_JSON("Invalid login token", "Invalid login token");
  }

  // Optional: Update last access time
  await member.update(
    { token_last_access_time: moment() },
    { where: { id: existingMember.id } }
  );

  delete existingMember.password;
  delete existingMember.set_invalid;
  delete existingMember.login_token;
  delete existingMember.token_last_access_time;
  delete existingMember.token_login_status;
  delete existingMember.createdAt;
  delete existingMember.updatedAt;

  return success_JSON(existingMember);
};

// login user if not expired
const  login = async (body) => {
  const { member } = await model();
  const { username, password } = body;

  try {
    const existingMember = await member.findOne({
      where: { username, set_invalid: false },
    });
    if (!existingMember) {
      return fail_JSON("USER_NOT_FOUND", "Invalid username or password");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingMember.password
    );
    if (!isPasswordValid) {
      return fail_JSON("INVALID_CREDENTIALS", "Invalid username or password");
    }

    delete existingMember.password;
    delete existingMember.set_invalid;
    delete existingMember.login_token;
    // delete existingMember.token_last_access_time;
    delete existingMember.token_login_status;
    delete existingMember.createdAt;
    delete existingMember.updatedAt;

    return success_JSON(existingMember);
  } catch (error) {
    await member_error_log("login_member error", "", body, error);

    return fail_JSON("", error.message);
  }
};

const logout = async (req, res) => {
  // Clear the cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    domain: req.hostname, // optional, use if you set it when creating the cookie
  });

  return success_JSON("", "Logout successfully");
};

// Forgot password: send reset email
const forgot_password = async (email) => {
  try {
    const { member } = await model();
    const user = await member.findOne({ where: { email, set_invalid: false } });
    if (!user) {
      return fail_JSON("USER_NOT_FOUND", "No account with that email");
    }

    // Generate a reset token and expiry (1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = moment().add(1, "hour").toDate();

    await member.update(
      { reset_token: resetToken, reset_token_expiry: resetTokenExpiry },
      { where: { id: user.id } }
    );

    // Send email with reset link
    await sendPasswordResetEmail(email, resetToken, user.username);

    return success_JSON("", "Password reset email sent");
  } catch (error) {
    await member_error_log("forgot_password error", "", { email }, error);
    return fail_JSON("", error.message);
  }
};

// Reset password: set new password using token
const reset_password = async (token, newPassword) => {
  try {
    const { member } = await model();
    const user = await member.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [require("sequelize").Op.gt]: new Date() },
        set_invalid: false,
      },
    });
    if (!user) {
      return fail_JSON("INVALID_OR_EXPIRED_TOKEN", "Invalid or expired reset token");
    }

    const encrypted = await password_encryption(newPassword);
    await member.update(
      { password: encrypted, reset_token: null, reset_token_expiry: null },
      { where: { id: user.id } }
    );

    return success_JSON("", "Password has been reset successfully");
  } catch (error) {
    await member_error_log("reset_password error", "", { token }, error);
    return fail_JSON("", error.message);
  }
};

module.exports = {
  handle_token,
  get_member_info_by_token,
  verify_token,
  login,
  logout,
  forgot_password,
  reset_password,
};

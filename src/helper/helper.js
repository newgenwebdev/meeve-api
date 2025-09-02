const bcrypt = require("bcrypt");
const axios = require("axios");

module.exports.password_encryption = async (password) => {
  return bcrypt.hash(password, 10);
};

// Function to generate random password
module.exports.generateRandomPassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

module.exports.success_JSON = (data, msg) => {
  return {
    code: 200,
    data,
    msg,
  };
};

module.exports.fail_JSON = (data, msg) => {
  return {
    code: 400,
    data,
    msg,
  };
};

module.exports.unauthorized_action = (
  data,
  msg = "Unauthorized to perform action"
) => {
  return {
    code: 401,
    data,
    msg,
  };
};

module.exports.axiosHelper = async (param, headers = {}) => {
  try {
    const response = await axios({ headers, ...param });
    return response.data;
  } catch (error) {
    const err = error.response ? error.response.data : error.message;
    // throw new Error(typeof err === "string" ? err : JSON.stringify(err));
    console.log("axiosHelper error--->", err);
  }
};

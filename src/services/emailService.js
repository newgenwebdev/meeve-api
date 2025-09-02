const mailgun = require('mailgun-js');
require('dotenv').config();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

const sendNewMemberNotification = async (email, username, password) => {
  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to: email,
    subject: 'Welcome to Meeve - Your Account Details',
    template: "new_member_welcome", // Create this template in Mailgun
    'h:X-Mailgun-Variables': JSON.stringify({
      username: username,
      password: password,
      login_url: process.env.FRONTEND_URL + '/login',
      // Add voucher details if needed
      voucher_1: "NEWDISC20P - 20% Discount Voucher",
      voucher_2: "NEW7DAYPASS - 7 day fitness pass"
    })
  };

  try {
    const response = await mg.messages().send(data);
    console.log('Email sent successfully:', response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// You can add more email templates/functions here
const sendOrderConfirmation = async (email,orderDetails) => {
  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to: email,
    subject: 'Order Confirmation - Meeve',
    template: "order_confirm",
    'h:X-Mailgun-Variables': JSON.stringify({
      username: orderDetails.member_details.username,
      order_id: orderDetails.id,
      order_status: orderDetails.order_status,
      // Add other order details as needed
    })
  };

  try {
    const response = await mg.messages().send(data);
    console.log('Order confirmation email sent:', response);
    return { success: true, message: 'Order confirmation email sent' };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  // console.log(resetUrl, 'resetUrl');
  const data = {
    from: process.env.MAILGUN_FROM_EMAIL,
    to: email,
    subject: 'Reset Your Meeve Password',
    template: "reeset_password", // Create this template in Mailgun
    'h:X-Mailgun-Variables': JSON.stringify({
      email: email,
      username: username,
      resetUrl: resetUrl,
    })
  };
  try {
    const response = await mg.messages().send(data);
    // console.log('Password reset email sent:', response);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendNewMemberNotification,
  sendOrderConfirmation,
  sendPasswordResetEmail,
}; 
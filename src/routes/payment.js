const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  initiate_payment,
  verify_payment,
  get_payment_methods,
  process_callback,
  get_payment_history,
  update_payment_status
} = require("../resources/payment");

// Initiate a payment for an order
router.post("/initiate", async (req, res) => {
  try {
    const result = await initiate_payment(req.body);
    res.json(result);
  } catch (error) {
    console.log("Error initiating payment:", error);
    res.json(fail_JSON("Failed to initiate payment", error));
  }
});

// Verify payment status
router.get("/verify/:paymentId", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const result = await verify_payment(paymentId);
    res.json(result);
  } catch (error) {
    console.log("Error verifying payment:", error);
    res.json(fail_JSON("Failed to verify payment", error));
  }
});

// Get all available payment methods
router.get("/methods", async (req, res) => {
  try {
    const result = await get_payment_methods();
    res.json(result);
  } catch (error) {
    console.log("Error fetching payment methods:", error);
    res.json(fail_JSON("Failed to fetch payment methods", error));
  }
});

// Process payment callback from payment gateway
router.post("/callback", async (req, res) => {
  try {
    const result = await process_callback(req.body);
    res.json(result);
  } catch (error) {
    console.log("Error processing payment callback:", error);
    res.json(fail_JSON("Failed to process payment callback", error));
  }
});

// Update payment status
router.post("/status/update/:paymentId", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const { status } = req.body;
    const result = await update_payment_status(paymentId, status);
    res.json(result);
  } catch (error) {
    console.log("Error updating payment status:", error);
    res.json(fail_JSON("Failed to update payment status", error));
  }
});

// Get payment history for an order
router.get("/history/:orderId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const result = await get_payment_history(orderId);
    res.json(result);
  } catch (error) {
    console.log("Error fetching payment history:", error);
    res.json(fail_JSON("Failed to fetch payment history", error));
  }
});

module.exports = router; 
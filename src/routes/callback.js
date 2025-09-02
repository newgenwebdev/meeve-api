const express = require("express");
const router = express.Router();
const {
  process_order_status_callback,
  process_stock_balance_callback,
} = require("../resources/callback");
const { commerce_pay_callback } = require("../resources/callback/commerce_pay");

// Webhook for updating order status
// router.post('/update-order-status', process_order_status_callback);

router.post("/update-order-status", async (req, res) => {
  try {
    // You may want to handle transactions here if needed
    //   console.log("req.body", req.body);
    const result = await process_order_status_callback(req.body, null);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/update-stock-balance", async (req, res) => {
  try {
    // You may want to handle transactions here if needed
    //   console.log("req.body", req.body);
    const result = await process_stock_balance_callback(req.body, null);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/commercepay/:id", async (req, res) => {
  try {
    const result = await commerce_pay_callback(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

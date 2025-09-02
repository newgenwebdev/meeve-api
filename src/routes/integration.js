const express = require('express');
const router = express.Router();
const { create_intergration_order } = require('../resources/intergration');

// Route for creating integration order
router.post('/create-integration-order', async (req, res) => {
  try {
    // You may want to handle transactions here if needed
    const result = await create_intergration_order(req.body, null);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 
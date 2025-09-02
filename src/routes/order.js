const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_order,
  update_order_detail,
  get_order,
  get_member_orders,
  list_order,
} = require("../resources/order");

// Create new order
router.post("/new", async (req, res) => {
  try {
    const result = await create_order(req);
    res.json(result);
  } catch (error) {
    console.log("Error creating order:", error);
    res.json(fail_JSON("Failed to create order", error));
  }
});

// Update order status
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_order_detail(req);
    res.json(result);
  } catch (error) {
    console.log("Error updating order status:", error);
    res.json(fail_JSON("Failed to update order status", error));
  }
});

// Get order by ID
router.get("/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await get_order(id);
    console.log('result', result);
    res.json(result);
  } catch (error) {
    console.log("Error getting order:", error);
    res.json(fail_JSON("Failed to get order", error));
  }
});

// Get member orders
router.get("/list/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;
    const result = await get_member_orders(memberId);
    res.json(result);
  } catch (error) {
    console.log("Error getting member orders:", error);
    res.json(fail_JSON("Failed to get member orders", error));
  }
});

// list all order
router.get("/list", async (req, res) => {
  try {
    const result = await list_order(req, res);

    res.json(result);
  } catch (error) {
    console.log("err list order", error);
    res.json(fail_JSON("list order fail", error));
  }
});

module.exports = router;

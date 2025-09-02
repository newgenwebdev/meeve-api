const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_payment_gateway,
  get_payment_gateway,
  list_payment_gateway,
  update_payment_gateway,
  delete_payment_gateway,
  get_payment_gateway_by_keyword
} = require("../resources/payment_gateway");


// Get all payment_gateways
router.get("/list", async (req, res) => {
  try {
    const result = await list_payment_gateway();

    res.json(result);
  } catch (error) {
    console.log("err list payment_gateway", error);
    res.json(fail_JSON("list payment_gateway fail", error));
  }
}); 

router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_payment_gateway(param);

    res.json(result);
  } catch (error) {
    console.log("err get payment_gateway detail", error);
    res.json(fail_JSON("get payment_gateway detail fail", error));
  }
}); 

router.post("/keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    const result = await get_payment_gateway_by_keyword(keyword);

    res.json(result);
    
  } catch (error) {
    console.log("err get payment_gateway by keyword", error);
    res.json(fail_JSON("get payment_gateway by keyword fail", error));
  }
});

// Create payment_gateway
router.post("/create", async (req, res) => {
  try {
    const result = await create_payment_gateway(req.body);

    res.json(result);
  } catch (error) {
    console.log("err register/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

// // Update payment_gateway
router.post("/update/:id", async (req, res) => {
  try {

    const result = await update_payment_gateway(req);

    res.json(result);
  } catch (error) {
    console.log("err update payment_gateway", error);
    res.json(fail_JSON("update payment_gateway fail", error));
  }
});

// delete member
router.post("/delete/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await delete_payment_gateway(param);

    res.json(result);
  } catch (error) {
    console.log("err delete payment_gateway detail", error);
    res.json(fail_JSON("delete payment_gateway fail", error));
  }
});

module.exports = router;

const express = require("express");
const { success_JSON, fail_JSON } = require("../helper/helper");
const {
  create_wallet,
  get_wallet,
  list_wallet,
  update_wallet_amount,
} = require("../resources/wallet");
const router = express.Router();

// create new member
router.post("/new", async (req, res) => {
  try {
    const result = await create_wallet(req.body.member_id);

    res.json(result);
  } catch (error) {
    console.log("err wallet/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const result = await get_wallet(req);

    res.json(result);
  } catch (error) {
    console.log("err get wallet detail", error);
    res.json(fail_JSON("get wallet detail fail", error));
  }
});

router.post("/list", async (req, res) => {
  try {
    const result = await list_wallet(req);

    res.json(result);
  } catch (error) {
    console.log("err list wallet detail", error);
    res.json(fail_JSON("list wallet detail fail", error));
  }
});

router.post("/updateamount/:id", async (req, res) => {
  try {
    const result = await update_wallet_amount(req);

    res.json(result);
  } catch (error) {
    console.log("err update wallet detail", error);
    res.json(fail_JSON("update wallet detail fail", error));
  }
});

module.exports = router;

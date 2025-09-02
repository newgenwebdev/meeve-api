const express = require("express");
const { success_JSON, fail_JSON } = require("../helper/helper");
const { list_wallet_trx } = require("../resources/wallet_trx");
const router = express.Router();

router.post("/list", async (req, res) => {
  try {
    const result = await list_wallet_trx(req);

    res.json(result);
  } catch (error) {
    console.log("err list wallet detail", error);
    res.json(fail_JSON("list wallet detail fail", error));
  }
});

module.exports = router;

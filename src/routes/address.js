const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_address,
  get_address,
  list_address,
  update_address,
  delete_address,
  get_address_by_keyword,
} = require("../resources/address");

// Get all member_addresss
router.get("/list", async (req, res) => {
  try {
    const result = await list_address(req);

    res.json(result);
  } catch (error) {
    console.log("err list address", error);
    res.json(fail_JSON("list address fail", error));
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const result = await get_address(req);

    res.json(result);
  } catch (error) {
    console.log("err get address detail", error);
    res.json(fail_JSON("get address detail fail", error));
  }
});

router.post("/keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    const result = await get_address_by_keyword(keyword);

    res.json(result);
  } catch (error) {
    console.log("err get address by keyword", error);
    res.json(fail_JSON("get address by keyword fail", error));
  }
});

// Create member_address
router.post("/create", async (req, res) => {
  try {
    const result = await create_address(req);

    res.json(result);
  } catch (error) {
    console.log("err create new address", error);
    res.json(fail_JSON("create new address fail", error));
  }
});

// // Update member_address
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_address(req);

    res.json(result);
  } catch (error) {
    console.log("err update address", error);
    res.json(fail_JSON("update address fail", error));
  }
});

// delete member
router.post("/delete/:id", async (req, res) => {
  try {
    const result = await delete_address(req);

    res.json(result);
  } catch (error) {
    console.log("err delete address detail", error);
    res.json(fail_JSON("delete address fail", error));
  }
});

router.post('/new', async (req, res) => {
  // ...create address logic...
});

module.exports = router;

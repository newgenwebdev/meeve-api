const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_voucher,
  get_voucher,
  list_voucher,
  update_voucher,
  delete_voucher,
  get_voucher_by_keyword,
  // get_voucher_by_rank_or_member,
  get_voucher_by_member,
} = require("../resources/voucher");

// Get all vouchers
router.get("/list", async (req, res) => {
  try {
    const result = await list_voucher(req, res);

    res.json(result);
  } catch (error) {
    console.log("err list voucher", error);
    res.json(fail_JSON("list voucher fail", error));
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_voucher(param);

    res.json(result);
  } catch (error) {
    console.log("err get voucher", error);
    res.json(fail_JSON("get voucher fail", error));
  }
});

router.post("/member", async (req, res) => {
  try {
    const { assigned_member_id } = req.body;
    const result = await get_voucher_by_member(assigned_member_id);

    res.json(result);
  } catch (error) {
    console.log("err get voucher", error);
    res.json(fail_JSON("get voucher fail", error));
  }
});

// router.post("/get_by_rank_or_member", async (req, res) => {
//   try {
//     const { assigned_rank_id, assigned_member_id } = req.body;
//     const result = await get_voucher_by_rank_or_member(
//       assigned_rank_id,
//       assigned_member_id
//     );

//     res.json(result);
//   } catch (error) {
//     console.log("err get voucher", error);
//     res.json(fail_JSON("get voucher fail", error));
//   }
// });

router.post("/keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    const result = await get_voucher_by_keyword(keyword);

    res.json(result);
  } catch (error) {
    console.log("err get voucher by keyword", error);
    res.json(fail_JSON("get voucher by keyword fail", error));
  }
});

// Create voucher
router.post("/create", async (req, res) => {
  try {
    const result = await create_voucher(req.body);

    res.json(result);
  } catch (error) {
    console.log("err register/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

// // Update voucher
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_voucher(req);

    res.json(result);
  } catch (error) {
    console.log("err update product", error);
    res.json(fail_JSON("update product fail", error));
  }
});

// delete member
router.post("/delete/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await delete_voucher(param);

    res.json(result);
  } catch (error) {
    console.log("err delete voucher detail", error);
    res.json(fail_JSON("delete voucher fail", error));
  }
});

module.exports = router;

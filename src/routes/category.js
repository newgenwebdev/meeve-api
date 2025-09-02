const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_category,
  get_category,
  list_category,
  update_category,
  delete_category,
  get_category_by_keyword,
} = require("../resources/category");

// Get all categorys
router.get("/list", async (req, res) => {
  try {
    const result = await list_category();

    res.json(result);
  } catch (error) {
    console.log("err list category", error);
    res.json(fail_JSON("list category fail", error));
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_category(param);

    res.json(result);
  } catch (error) {
    console.log("err get category detail", error);
    res.json(fail_JSON("get category detail fail", error));
  }
});

router.post("/keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    const result = await get_category_by_keyword(keyword);

    res.json(result);
  } catch (error) {
    console.log("err get category by keyword", error);
    res.json(fail_JSON("get category by keyword fail", error));
  }
});

// Create category
router.post("/create", async (req, res) => {
  try {
    const result = await create_category(req.body);

    res.json(result);
  } catch (error) {
    console.log("err register/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

// // Update category
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_category(req);

    res.json(result);
  } catch (error) {
    console.log("err update category", error);
    res.json(fail_JSON("update category fail", error));
  }
});

// delete member
router.post("/delete/:id", async (req, res) => {
  try {
    const result = await delete_category(req);

    res.json(result);
  } catch (error) {
    console.log("err delete category detail", error);
    res.json(fail_JSON("delete category fail", error));
  }
});

module.exports = router;

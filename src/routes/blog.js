const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_blog,
  update_blog,
  delete_blog,
  search_blog,
  get_blog,
} = require("../resources/blog");

//Create Blog
router.post("/", async (req, res) => {
  try {
    const result = await create_blog(req);
    res.json(result);
  } catch (error) {
    console.error("Create Blog Error:", error);
    res.json(fail_JSON("create blog fail", error));
  }
});

//Update Blog
router.put("/update/:slug", async (req, res) => {
  try {
    const result = await update_blog(req);
    res.json(result);
  } catch (error) {
    console.error("Update Blog error:", error);
    res.json(fail_JSON("update blog fail", error));
  }
});

//Delete Blog
router.delete("/delete/:slug", async (req, res) => {
  try {
    console.log("DELETE BLOG"); //TODO
    console.log("ROLE CHECK", req?.secret);
    const result = await delete_blog(req);
    res.json(result);
  } catch (error) {
    console.error("Delete Blog error:", error);
    res.json(fail_JSON("delete product fail", error));
  }
});

//Get Blog
router.get("/post/:slug", async (req, res) => {
  try {
    const result = await get_blog(req);
    res.json(result);
  } catch (error) {
    console.error("Get Blog error:", error);
    res.json(fail_JSON("get blog fail", error));
  }
});

//Search Blog
//TODO: dynamic search
router.get("/search", async (req, res) => {
  try {
    const result = await search_blog(req);
    res.json(result);
  } catch (error) {
    console.error("Search Blog error:", error);
    res.json(fail_JSON("search product fail", error));
  }
});

//Search Blog
//TODO: dynamic search
router.get("/list", async (req, res) => {
  try {
    // console.log("Search BLOG"); //TODO:Remove
    const result = await search_blog(req);
    res.json(result);
  } catch (error) {
    console.error("Search Blog error:", error);
    res.json(fail_JSON("search blog fail", error));
  }
});

module.exports = router;

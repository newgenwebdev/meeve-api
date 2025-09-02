const express = require("express");
const router = express.Router();
const multer = require('multer');
const { fail_JSON } = require("../helper/helper");
const {
  create_product,
  get_product,
  list_product,
  update_product,
  delete_product,
  get_product_by_keyword,
  uploadImage,
  deleteImage,
  getSignedUrl,
  list_product_with_signed_urls,
} = require("../resources/product");

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Get all Products
router.get("/list", async (req, res) => {
  try {
    const result = await list_product(req);
    res.json(result);
  } catch (error) {
    console.log("err list product", error);
    res.json(fail_JSON("list product fail", error));
  }
});

// Get all Products with signed URLs (for private S3 buckets)
router.get("/list-with-signed-urls", async (req, res) => {
  try {
    const result = await list_product_with_signed_urls(req);
    res.json(result);
  } catch (error) {
    console.log("err list product with signed urls", error);
    res.json(fail_JSON("list product with signed urls fail", error));
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_product(param);

    res.json(result);
  } catch (error) {
    console.log("err get product detail", error);
    res.json(fail_JSON("get product detail fail", error));
  }
});

router.post("/keyword", async (req, res) => {
  try {
    const { keyword } = req.body;

    const result = await get_product_by_keyword(keyword);

    res.json(result);
  } catch (error) {
    console.log("err get product by keyword", error);
    res.json(fail_JSON("get product by keyword fail", error));
  }
});

// Create Product
router.post("/create", async (req, res) => {
  try {
    const result = await create_product(req);

    res.json(result);
  } catch (error) {
    console.log("err product/new", error);
    res.json(fail_JSON("product/new fail", error));
  }
});

// // Update Product
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_product(req);

    res.json(result);
  } catch (error) {
    console.log("err update product", error);
    res.json(fail_JSON("update product fail", error));
  }
});

// delete product
router.post("/delete/:id", async (req, res) => {
  try {
    console.log("delete product req", req);
    const result = await delete_product(req);

    res.json(result);
  } catch (error) {
    console.log("err delete product detail", error);
    res.json(fail_JSON("delete product fail", error));
  }
});

// Upload product image
router.post("/upload-image", upload.single('image'), async (req, res) => {
  try {
    await uploadImage(req, res);
  } catch (error) {
    console.log("err upload product image", error);
    res.status(500).json(fail_JSON("upload product image fail", error.message));
  }
});

// Delete product image
router.post("/delete-image", async (req, res) => {
  try {
    await deleteImage(req, res);
  } catch (error) {
    console.log("err delete product image", error);
    res.status(500).json(fail_JSON("delete product image fail", error.message));
  }
});

// Get signed URL for S3 object
router.post("/get-signed-url", async (req, res) => {
  try {
    await getSignedUrl(req, res);
  } catch (error) {
    console.log("err get signed url", error);
    res.status(500).json(fail_JSON("get signed url fail", error.message));
  }
});

module.exports = router;

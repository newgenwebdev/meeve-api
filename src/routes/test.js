const express = require("express");
const router = express.Router();

router.get("/test_get", async (req, res) => {
  res.send("test get ok");
});

router.post("/test_post", async (req, res) => {
  res.send("test post ok");
});

module.exports = router;

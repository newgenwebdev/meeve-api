const express = require("express");
const { fail_JSON } = require("../helper/helper");
const {
  create_rank,
  get_rank,
  list_rank,
  update_rank,
  delete_rank,
} = require("../resources/rank");
const router = express.Router();

// create new rank
router.post("/new", async (req, res) => {
  console.log("Raw body:", req.body);

  try {
    let rankData = req.body;
    
    // Handle Google sign-in data
    // if (rankData.googleData) {
    //   const { email, name, picture, sub: googleId } = rankData.googleData;
      
    //   // Create rank data from Google profile
    //   rankData = {
    //     username: email.split('@')[0], // Use email prefix as username
    //     email: email,
    //     full_name: name,
    //     profile_picture: picture,
    //     google_id: googleId,
    //     rank_id: 20, // Default to customer rank
    //     status: 1, // Active status
    //     password: Math.random().toString(36).slice(-8), // Generate random password
    //     ...rankData // Keep any additional data
    //   };
    // }

    const result = await create_rank(rankData);

    res.json(result);
  } catch (error) {
    console.log("err register/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

// get rank detail
router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_rank(param);

    res.json(result);
  } catch (error) {
    console.log("err get rank detail", error);
    res.json(fail_JSON("get rank detail fail", error));
  }
});

// list all rank
router.get("/list", async (req, res) => {
  try {
    const result = await list_rank(req, res);

    res.json(result);
  } catch (error) {
    console.log("err list rank", error);
    res.json(fail_JSON("list rank fail", error));
  }
});

// update rank
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_rank(req);

    res.json(result);
  } catch (error) {
    console.log("err update rank", error);
    res.json(fail_JSON("update rank fail", error));
  }
});

// delete rank
router.post("/delete/:id", async (req, res) => {
  try {
    const result = await delete_rank(req);

    res.json(result);
  } catch (error) {
    console.log("err delete rank detail", error);
    res.json(fail_JSON("delete rank fail", error));
  }
});

module.exports = router;

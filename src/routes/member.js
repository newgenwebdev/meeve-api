const express = require("express");
const { fail_JSON } = require("../helper/helper");
const {
  create_member,
  get_member,
  list_member,
  update_member,
  delete_member,
  get_member_addresses,
  update_member_password,
} = require("../resources/member");
const router = express.Router();

// create new member
router.post("/new", async (req, res) => {
  // console.log("Headers:", req.headers);
  // console.log("Raw body:", req.body);
  // console.log("Content-Type:", req.headers["content-type"]);

  try {
    let memberData = req.body;

    // Handle Google sign-in data
    if (memberData.googleData) {
      const { email, name, picture, sub: googleId } = memberData.googleData;

      // Create member data from Google profile
      memberData = {
        username: email.split("@")[0], // Use email prefix as username
        email: email,
        full_name: name,
        profile_picture: picture,
        google_id: googleId,
        role_id: 20, // Default to customer role
        status: 1, // Active status
        password: Math.random().toString(36).slice(-8), // Generate random password
        ...memberData, // Keep any additional data
      };
    }
    // Validate required fields
    if (!memberData.email || !memberData.username) {
      return res.json(fail_JSON("Missing required fields"));
    }

    const result = await create_member(memberData);

    res.json(result);
  } catch (error) {
    console.log("err register/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

// get member detail
router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_member(param);

    res.json(result);
  } catch (error) {
    console.log("err get member detail", error);
    res.json(fail_JSON("get member detail fail", error));
  }
});

// list all member
router.get("/list", async (req, res) => {
  try {
    const result = await list_member(req, res);
    console.log("result", result);
    res.json(result);
  } catch (error) {
    console.log("err list member", error);
    res.json(fail_JSON("list member fail", error));
  }
});

// update member
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_member(req);

    res.json(result);
  } catch (error) {
    console.log("err update member", error);
    res.json(fail_JSON("update member fail", error));
  }
});

// delete member
router.post("/delete/:id", async (req, res) => {
  try {
    const result = await delete_member(req);

    res.json(result);
  } catch (error) {
    console.log("err delete member detail", error);
    res.json(fail_JSON("delete member fail", error));
  }
});

// get member addresses
router.get("/addresses/:member_id", async (req, res) => {
  try {
    const response = await get_member_addresses(req.params.member_id);
    res.json(response);
  } catch (error) {
    res.json(fail_JSON("", error.message));
  }
});

// update member password
router.post("/update-password/:id", async (req, res) => {
  try {
    const result = await update_member_password(req);
    res.json(result);
  } catch (error) {
    console.log("err update member password", error);
    res.json(fail_JSON("update member password fail", error));
  }
});

module.exports = router;

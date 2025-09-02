const express = require("express");
const { fail_JSON } = require("../helper/helper");
const {
  create_role,
  get_role,
  list_role,
  update_role,
  delete_role,
} = require("../resources/role");
const router = express.Router();

// create new role
router.post("/new", async (req, res) => {

  try {
    let roleData = req.body;
    
    // Handle Google sign-in data
    // if (roleData.googleData) {
    //   const { email, name, picture, sub: googleId } = roleData.googleData;
      
    //   // Create role data from Google profile
    //   roleData = {
    //     username: email.split('@')[0], // Use email prefix as username
    //     email: email,
    //     full_name: name,
    //     profile_picture: picture,
    //     google_id: googleId,
    //     role_id: 20, // Default to customer role
    //     status: 1, // Active status
    //     password: Math.random().toString(36).slice(-8), // Generate random password
    //     ...roleData // Keep any additional data
    //   };
    // }

    const result = await create_role(roleData);

    res.json(result);
  } catch (error) {
    console.log("err register/new", error);
    res.json(fail_JSON("register/new fail", error));
  }
});

// get role detail
router.get("/detail/:id", async (req, res) => {
  try {
    const param = +req.params.id;
    const result = await get_role(param);

    res.json(result);
  } catch (error) {
    console.log("err get role detail", error);
    res.json(fail_JSON("get role detail fail", error));
  }
});

// list all role
router.get("/list", async (req, res) => {
  try {
    const result = await list_role(req, res);

    res.json(result);
  } catch (error) {
    console.log("err list role", error);
    res.json(fail_JSON("list role fail", error));
  }
});

// update role
router.post("/update/:id", async (req, res) => {
  try {
    const result = await update_role(req);

    res.json(result);
  } catch (error) {
    console.log("err update role", error);
    res.json(fail_JSON("update role fail", error));
  }
});

// delete role
router.post("/delete/:id", async (req, res) => {
  try {
    const result = await delete_role(req);

    res.json(result);
  } catch (error) {
    console.log("err delete role detail", error);
    res.json(fail_JSON("delete role fail", error));
  }
});

module.exports = router;

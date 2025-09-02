const express = require("express");
const router = express.Router();
const { fail_JSON } = require("../helper/helper");
const {
  create_workout_program,
  update_workout_program,
  delete_workout_program,
  search_workout_program,
  get_workout_program,
} = require("../resources/workout");

//Create Workout Program
router.post("/", async (req, res) => {
  try {
    const result = await create_workout_program(req);
    res.json(result);
  } catch (error) {
    console.error("Create Workout Program Error:", error);
    res.json(fail_JSON("create workout program fail", error));
  }
});

//Update Workout Program
router.put("/:id", async (req, res) => {
  try {
    const result = await update_workout_program(req);
    res.json(result);
  } catch (error) {
    console.error("Update Workout Program error:", error);
    res.json(fail_JSON("update workout program fail", error));
  }
});

//Delete Workout Program
router.delete("/:id", async (req, res) => {
  try {
    console.log("DELETE WORKOUT PROGRAM");
    console.log("ROLE CHECK", req?.secret);
    const result = await delete_workout_program(req);
    res.json(result);
  } catch (error) {
    console.error("Delete Workout Program error:", error);
    res.json(fail_JSON("delete workout program fail", error));
  }
});

//Get Workout Program by slug (for public view)
router.get("/post/:slug", async (req, res) => {
  try {
    const result = await get_workout_program(req);
    res.json(result);
  } catch (error) {
    console.error("Get Workout Program error:", error);
    res.json(fail_JSON("get workout program fail", error));
  }
});

//Search Workout Programs
router.get("/search", async (req, res) => {
  try {
    const result = await search_workout_program(req);
    res.json(result);
  } catch (error) {
    console.error("Search Workout Program error:", error);
    res.json(fail_JSON("search workout program fail", error));
  }
});

//List All Workout Programs
router.get("/list", async (req, res) => {
  try {
    console.log("List Workout Programs");
    const result = await search_workout_program(req);
    res.json(result);
  } catch (error) {
    console.error("List Workout Programs error:", error);
    res.json(fail_JSON("list workout programs fail", error));
  }
});

module.exports = router; 
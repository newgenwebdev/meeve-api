const { MEMBER_ROLE, WORKOUT_CONTENT_TYPE } = require("../../helper/constant");
const {
  success_JSON,
  fail_JSON,
  unauthorized_action,
} = require("../../helper/helper");
const model = require("../../model");
const workout_audit_log = require("../../model/workout_audit_log");
const workout_error_log = require("../../model/workout_error_log");

const attributes = [
  "id",
  "member_id",
  "content_type",
  "title",
  "slug",
  "program_status",
  "author",
  "categories",
  "tags",
  "featured_image",
  "featured_image_alt",
  "featured_video",
  "featured_video_alt",
  "body",
  "summary",
  "seo_title",
  "meta_description",
  "set_invalid",
  "updatedAt",
  "createdAt",
];

//Create Workout Program
const create_workout_program = async (req) => {
  const { workout } = await model();
  const transaction = await workout.sequelize.transaction();

  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }

    if (!workout) {
      throw new Error("Workout Program model not properly initialized");
    }

    const param = req?.body;
    param.member_id = req?.secret?.id;
    param.author = req?.secret?.name;
    param.slug = param.title.replace(/\s+/g, "-").toLowerCase();
    param.content_type = param.content_type || "WorkoutProgram";
    param.program_status = param.status || "Published";

    const workoutProgram = await workout.create(param, { transaction });

    await transaction.commit();
    return success_JSON(workoutProgram);
  } catch (error) {
    await transaction.rollback();
    console.log("create_workout_program error", error);
    return fail_JSON("", error.message);
  }
};

//Update Workout Program
const update_workout_program = async (req) => {
  const { workout } = await model();
  const id = +req.params.id;
  const param = req.body;

  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }

    if (!workout) {
      throw new Error("Workout Program model not properly initialized");
    }

    const workoutProgramToUpdate = await workout.findOne({
      where: { id, set_invalid: false },
    });

    if (!workoutProgramToUpdate) {
      return fail_JSON("", "Workout Program not found or invalid");
    }

    if (param.status) {
      param.program_status = param.status;
      delete param.status;
    }

    const [updatedRowsCount] = await workout.update(param, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    return success_JSON();
  } catch (error) {
    console.log("update_workout_program error", error);
    return fail_JSON("", error.message);
  }
};

//Delete Workout Program
const delete_workout_program = async (req) => {
  const { workout } = await model();
  const id = +req.params.id;

  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }

    if (!workout) {
      throw new Error("Workout Program model not properly initialized");
    }

    const workoutProgramToUpdate = await workout.findOne({
      where: { id: id, set_invalid: false },
    });

    if (!workoutProgramToUpdate) {
      return fail_JSON("", "Workout Program not found or invalid");
    }

    const [updatedRowsCount] = await workout.update(
      { set_invalid: true },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    return success_JSON();
  } catch (error) {
    console.error("DELETE WORKOUT PROGRAM ERROR: ", error);
    return fail_JSON("", error.message);
  }
};

//Get Workout Program by slug
const get_workout_program = async (req) => {
  const { workout } = await model();
  const slug = `${req.params.slug}`;

  try {
    const result = await workout.findOne({
      where: { slug, set_invalid: false },
      attributes,
    });
    return success_JSON(result);
  } catch (error) {
    console.log("Get workout program error:", error);
    return fail_JSON("", error.message);
  }
};

//Search/List All Workout Programs
const search_workout_program = async (req) => {
  const { workout } = await model();

  try {
    const result = await workout.findAll({
      where: { set_invalid: false },
      attributes,
      order: [["updatedAt", "DESC"]],
    });
    return success_JSON(result);
  } catch (error) {
    console.log("workout program search error:", error);
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_workout_program,
  update_workout_program,
  delete_workout_program,
  get_workout_program,
  search_workout_program,
}; 
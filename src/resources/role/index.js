const {
  password_encryption,
  success_JSON,
  fail_JSON,
  unauthorized_action,
} = require("../../helper/helper");
const model = require("../../model");
const { role_error_log, role_audit_log } = require("../audit_log");
const { create_wallet } = require("../wallet");
const { MEMBER_ROLE } = require("../../helper/constant");

const attributes = [
  "id",
  "name",
  "set_invalid"
];

// register new user then create wallet
const create_role = async (param) => {
  const { user_role } = await model();
  const transaction = await user_role.sequelize.transaction(); // Start transaction

  try {
    // Check if name already exists
    const existingrole = await user_role.findOne({
      where: { name: param.name },
      transaction, // Make sure to check within transaction
    });
    
    if (existingrole) {
      return fail_JSON("", "role already exists");
    }

    // // not exist then create
    let newRole = await user_role.create(
      {
        name: param.name,
        set_invalid: param.set_invalid,
      },
      { transaction }
    );

    // // Commit the transaction (save changes)
    await transaction.commit();

    const result = await get_role(newRole.id);

    return success_JSON(result?.data);
  } catch (error) {
    console.log("error", error);
    // Rollback the transaction (undo changes)
    await transaction.rollback();
    // console.log("error", error);
    // await role_error_log("create_role error", "", param, error);

    return fail_JSON("", error.message);
  }
};

// done
const get_role = async (id) => {
  try {
    const { user_role } = await model();

    let result = await user_role.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(result);
  } catch (error) {
    await role_error_log("get_role error", "", param, error);

    return fail_JSON("", error.message);
  }
};

// done
const list_role = async (req, res) => {
  try {
    const { user_role } = await model();
    let where = {};

    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
        where = { id: req?.secret?.id};
    }

    let result = await user_role.findAll({
      where: { ...where,set_invalid: false },
      attributes,
    });

    return success_JSON(result);
  } catch (error) {
    console.log("error", error);
    // await role_error_log("list_role error", req?.secret?.id || 0, "", error);

    return fail_JSON("", error.message);
  }
};

// done
const update_role = async (req) => {
  const id = +req.params.id;
  const param = req.body;
  let where = {};

  try {
    const { user_role } = await model();
    const roleToUpdate = await user_role.findOne({
      where: { id, set_invalid: false },
    });

    if (!roleToUpdate) {
      return fail_JSON("", "role not found or invalid!");
    }

    const [updatedRowsCount, updatedRows] = await user_role.update(param, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    await role_audit_log(
      "update_role",
      req?.secret?.id,
      { ...param, id },
      updatedRows
    );

    const updatedData = await get_role(id);

    return success_JSON(updatedData?.data, "record updated successfully");
  } catch (error) {
    await role_error_log("update_role error", id, param, error);

    return fail_JSON("", error.message);
  }
};

const delete_role = async (req) => {
  const id = +req.params.id;
  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }
    const { user_role } = await model();
    const roleToDelete = await user_role.findOne({
      where: { id, set_invalid: false },
    });

    if (!roleToDelete) {
      return fail_JSON("", "role not exist or invalid!");
    }

    const [updatedRowsCount, updatedRows] = await user_role.update(
      { set_invalid: true },
      {
        where: { id },
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "fail to delete");
    }

    await role_audit_log(
      "delete_role",
      req?.secret?.id,
      { id },
      updatedRows
    );

    return success_JSON("", "deleted successfully");
  } catch (error) {
    await role_error_log("delete_role error", id, "", error);

    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_role,
  get_role,
  list_role,
  update_role,
  delete_role,
};

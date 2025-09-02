const { MEMBER_ROLE, MEMBER_RANK } = require("../../helper/constant");
const {
  password_encryption,
  success_JSON,
  fail_JSON,
  unauthorized_action,
  generateRandomPassword,
} = require("../../helper/helper");
const model = require("../../model");
const { member_error_log, member_audit_log } = require("../audit_log");
const { create_wallet, first_time_bonus } = require("../wallet");
const { create_voucher } = require("../voucher");
const { delete_voucher_by_member_id } = require("../voucher");
const { sendNewMemberNotification } = require("../../services/emailService");

const attributes = [
  "id",
  "name",
  "username",
  "email",
  "contact_no",
  "role_id",
  "member_rank_id",
  "total_spend_amount",
  "set_invalid",
];

// register new user then create wallet
const create_member = async (param) => {
  const { member } = await model();
  const transaction = await member.sequelize.transaction(); // Start transaction

  try {
    // Check if username already exists
    const existingMember = await member.findOne({
      where: { username: param.username, set_invalid: false },
      transaction,
    });

    if (existingMember) {
      await transaction.rollback();
      return fail_JSON("DUPLICATE_USERNAME", "Username already taken");
    }

    const existingEmailMember = await member.findOne({
      where: { email: param.email, set_invalid: false },
      transaction,
    });

    if (existingEmailMember) {
      await transaction.rollback();
      return fail_JSON("DUPLICATE_EMAIL", "Email already taken");
    }

    // Generate random password if not provided
    if (!param.password) {
      param.password = generateRandomPassword();
    }
    console.log("param", param);
    // not exist then create
    let newMem = await member.create(
      {
        name: param.name,
        username: param.username,
        password: await password_encryption(param.password),
        email: param.email,
        contact_no: param.contact_no,
        member_rank_id: param.member_rank_id,
        role_id: param.role_id,
        set_invalid: false,
        createdAt: new Date(),
        created_by: param?.secret?.id || null,
      },
      { transaction }
    );
    console.log("newMem", newMem);
    // created member then use member id to create wallet
    const walletResponse = await create_wallet(newMem.id, transaction);
    if (walletResponse.code === 400) {
      await transaction.rollback();
      return fail_JSON(walletResponse?.data, "register wallet creation failed");
    }

    // created member then use member id to create voucher
    const voucherParam = [
      {
        code: "NEWDISC20P",
        name: "20 % Discount Voucher",
        description: "New Member 20 % Discount Voucher",
        discount_type: "percentage",
        percentage: 20,
        assigned_member_id: newMem.id,
        quantity: 1,
      },
      {
        code: "NEW7DAYPASS",
        name: "7 day fitness pass",
        description: "Free 7 day pass in viking fitness for New Members",
        discount_type: "gift",
        assigned_member_id: newMem.id,
        quantity: 1,
      },
    ];
    const voucherResponse = await create_voucher(voucherParam, transaction);
    if (voucherResponse.code === 400) {
      await transaction.rollback();
      return fail_JSON(
        voucherResponse?.data,
        "register voucher creation failed"
      );
    }

    // Commit the transaction (save changes)
    await transaction.commit();

    const result = await get_member(newMem.id);
    // result.data.password = param.password; // Include the generated password in response

    // Send email notification with Mailgun
    try {
      await sendNewMemberNotification(
        param.email,
        param.username,
        param.password
      );
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Don't fail the whole operation if email fails
    }

    return success_JSON(result?.data);
  } catch (error) {
    // Rollback the transaction (undo changes)
    await transaction.rollback();
    await member_error_log("create_member error", "", param, error);

    return fail_JSON("", error.message);
  }
};

// done
const get_member = async (id) => {
  try {
    const { member } = await model();

    let result = await member.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(result);
  } catch (error) {
    await member_error_log("get_member error", "", param, error);

    return fail_JSON("", error.message);
  }
};

// done
const list_member = async (req, res) => {
  try {
    const { member } = await model();
    let where = {};

    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      where = { id: req?.secret?.id };
    }

    let result = await member.findAll({
      where: { ...where, set_invalid: false },
      attributes,
    });

    return success_JSON(result);
  } catch (error) {
    await member_error_log("list_member error", req?.secret?.id, "", error);

    return fail_JSON("", error.message);
  }
};

// done
const update_member = async (req) => {
  const id = +req.params.id;
  const param = req.body;
  try {
    const { member } = await model();
    const memberToUpdate = await member.findOne({
      where: { id, set_invalid: false },
    });

    if (!memberToUpdate) {
      return fail_JSON("", "Member not found or invalid!");
    }

    const [updatedRowsCount, updatedRows] = await member.update(param, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    await member_audit_log(
      "update_member",
      req?.secret?.id,
      { ...param, id },
      updatedRows
    );

    const updatedData = await get_member(id);

    return success_JSON(updatedData?.data, "record updated successfully");
  } catch (error) {
    await member_error_log("update_member error", id, param, error);

    return fail_JSON("", error.message);
  }
};

const delete_member = async (req) => {
  const id = +req.params.id;
  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }
    const { member } = await model();
    const memberToDelete = await member.findOne({
      where: { id, set_invalid: false },
    });

    if (!memberToDelete) {
      return fail_JSON("", "Member not exist or invalid!");
    }

    const [updatedRowsCount, updatedRows] = await member.update(
      { set_invalid: true },
      {
        where: { id },
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "fail to delete");
    }

    await member_audit_log(
      "delete_member",
      req?.secret?.id,
      { id },
      updatedRows
    );
    const voucherResponse = await delete_voucher_by_member_id(id);
    if (voucherResponse.code === 400) {
      await transaction.rollback();
      return fail_JSON(
        voucherResponse?.data,
        "register voucher creation failed"
      );
    }
    return success_JSON("", "deleted successfully");
  } catch (error) {
    await member_error_log(
      "delete_member error",
      req?.secret?.id,
      { id },
      error
    );

    return fail_JSON("", error.message);
  }
};

const update_member_total_spent = async (param, transaction) => {
  const { member } = await model();

  try {
    const memberToUpdate = await member.findOne({
      where: { id: param.member_id, set_invalid: false },
      transaction,
    });

    const [updatedRowsCount] = await member.update(
      {
        total_spend_amount: parseFloat(
          memberToUpdate.total_spend_amount + param.total_amount
        ),
      },
      {
        where: { id: memberToUpdate.id },
        transaction,
      }
    );

    const memberRes = await member.findOne({
      where: { id: param.member_id, set_invalid: false },
      transaction,
    });

    if (updatedRowsCount === 0) {
      return fail_JSON("", "fail to no record updated");
    }

    await member_audit_log(
      "update_member_total_spent",
      "order_payment_success",
      {
        order_id: param.id,
        member_id: param.member_id,
        total_amount: param.total_amount,
      },
      updatedRows,
      transaction
    );

    return memberRes;
  } catch (error) {
    await member_error_log(
      "update_member_total_spent error",
      "order_payment_success",
      {
        order_id: param.id,
        member_id: param.member_id,
        total_amount: param.total_amount,
      },
      error
    );

    return error.message;
  }
};

// check and update member rank base on total spent
const update_member_rank = async (param, transaction) => {
  const { member, user_rank } = await model();

  try {
    const memberToUpdate = await member.findOne({
      where: { id: param.member_id, set_invalid: false },
      transaction,
    });
    const rankList = await user_rank.findAll({
      where: { set_invalid: false },
      order: [["rank_up_criteria", "ASC"]],
      transaction,
    });

    // Find the highest rank the member qualifies for
    let newRankId = memberToUpdate.member_rank_id; // default current rank

    if (memberToUpdate.member_rank_id === rankList[0].id) {
      newRankId = rankList[1].id; // if is bronze then upgrade to silver
    } else {
      for (const rank of rankList) {
        if (memberToUpdate.total_spend_amount >= rank.rank_up_criteria) {
          newRankId = rank.id; // keep upgrading if qualify
        }
      }
    }

    // Check if rank actually changed
    if (newRankId === memberToUpdate.member_rank_id) {
      console.log("No rank upgrade needed.");
      return memberToUpdate; // No update needed
    }

    const [updatedRowsCount] = await member.update(
      {
        member_rank_id: newRankId,
      },
      {
        where: { id: memberToUpdate.id },
        transaction,
      }
    );

    // // check is ugrade to silver then give 1st time bonus point
    // if (updatedRowsCount === 1 && newRankId === MEMBER_RANK.SILVER) {
    //   await first_time_bonus(param, transaction);
    // }

    const memberRes = await member.findOne({
      where: { id: param.member_id, set_invalid: false },
      transaction,
    });

    await member_audit_log(
      "update_member_rank",
      "total_spent_reach",
      {
        order_id: param.id,
        member_id: param.member_id,
        total_amount: param.total_amount,
        total_spend_amount: memberToUpdate.total_spend_amount,
        prev_rank: memberToUpdate.member_rank_id,
        new_rank: newRankId,
      },
      memberRes,
      transaction
    );

    return memberRes;
  } catch (error) {
    await member_error_log(
      "update_member_rank error",
      "total_spent_reach",
      {
        order_id: param.id,
        member_id: param.member_id,
        total_amount: param.total_amount,
      },
      error
    );

    return error.message;
  }
};

const get_member_addresses = async (member_id) => {
  const { member_address } = await model();

  try {
    if (!member_address) {
      throw new Error("member_address model not properly initialized");
    }

    const addresses = await member_address.findAll({
      where: {
        member_id: member_id,
        set_invalid: false,
      },
      order: [["createdAt", "DESC"]],
    });

    return success_JSON(addresses);
  } catch (error) {
    console.error("Error fetching member addresses:", error);
    return fail_JSON("", error.message);
  }
};

const update_member_password = async (req) => {
  const id = +req.params.id;
  const { oldPassword, newPassword } = req.body;
  try {
    const { member } = await model();
    const memberToUpdate = await member.findOne({
      where: { id, set_invalid: false },
    });

    if (!memberToUpdate) {
      return fail_JSON("", "Member not found or invalid!");
    }

    // Check old password
    const isMatch = await memberToUpdate.validPassword(oldPassword);
    if (!isMatch) {
      return fail_JSON("", "Old password is incorrect");
    }

    // Update password
    const encrypted = await password_encryption(newPassword);
    await member.update({ password: encrypted }, { where: { id } });

    await member_audit_log(
      "update_member_password",
      req?.secret?.id,
      { id },
      {}
    );

    return success_JSON("", "Password updated successfully");
  } catch (error) {
    await member_error_log("update_member_password error", id, {}, error);
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_member,
  get_member,
  list_member,
  update_member,
  delete_member,
  update_member_total_spent,
  update_member_rank,
  get_member_addresses,
  update_member_password,
};

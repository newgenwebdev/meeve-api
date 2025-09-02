const { MEMBER_ROLE, PAYMENT_OPTION } = require("../../helper/constant");
const {
  password_encryption,
  success_JSON,
  fail_JSON,
} = require("../../helper/helper");
const model = require("../../model");
const { wallet_error_log, wallet_audit_log } = require("../audit_log");

const attributes = ["id", "member_id", "amount"];

const create_wallet = async (member_id, transaction) => {
  try {
    const { wallet } = await model();

    const newWallet = await wallet.create(
      {
        member_id,
        amount: 0, // Default balance
      },
      { transaction }
    );

    const result = await get_wallet(member_id);

    if (result) {
      await wallet_audit_log("create_wallet", member_id, "", result);
    }

    return success_JSON(result?.data);
  } catch (error) {
    console.log("create_wallet error", error);
    await wallet_error_log("create_wallet error", member_id, "", error);

    return fail_JSON("", error.message);
  }
};

const get_wallet = async (req) => {
  const member_id = req.params?.id ?? req;

  try {
    const { wallet } = await model();

    const result = await wallet.findOne({
      where: { member_id, set_invalid: false },
      attributes,
    });

    return success_JSON(result);
  } catch (error) {
    console.log("get_wallet error", error);
    await wallet_error_log("get_wallet error", member_id, "", error);

    return fail_JSON("", error.message);
  }
};

const list_wallet = async (req) => {
  let where = {};
  if (
    ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(req?.secret?.role_id)
  ) {
    where = { member_id: req?.secret?.id };
  }
  try {
    const { wallet } = await model();

    const result = await wallet.findAll({
      where: { ...where, set_invalid: false },
      attributes,
    });

    return success_JSON(result);
  } catch (error) {
    console.log("list_wallet error", error);
    await wallet_error_log("list_wallet error", member_id, "", error);

    return fail_JSON("", error.message);
  }
};

const update_wallet_amount = async (req) => {
  if (
    ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(req?.secret?.role_id)
  ) {
    return unauthorized_action();
  }

  const id = +req.params.id;
  const newAmount = req?.body?.amount;
  try {
    const { wallet } = await model();

    const exist = await wallet.findOne({
      where: { member_id: id, set_invalid: false },
      attributes,
    });

    console.log("exist", exist);

    const new_bal = exist.amount + parseFloat(newAmount);
    console.log("newnew_balVal", new_bal);

    const [updatedRowsCount] = await wallet.update(
      { amount: new_bal },
      {
        where: { id },
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    await wallet_audit_log("update_wallet_amount", req?.secret?.id, {
      param: newAmount,
      member_id: id,
      prev_bal: exist?.amount,
      new_bal,
    });

    return success_JSON("", "balance updated");
  } catch (error) {
    console.log("update_wallet error", error);
    await wallet_error_log(
      "update_wallet error",
      req?.secret?.id,
      {
        param: newAmount,
        member_id: id,
      },
      error
    );

    return fail_JSON("", error.message);
  }
};

// add wallet amount upon payment success
const add_wallet_amount = async (param, transaction) => {
  try {
    const { wallet, member, user_rank } = await model();

    const exist = await wallet.findOne({
      where: { member_id: param.member_id, set_invalid: false },
      attributes,
      transaction,
    });
    const memberRes = await member.findOne({
      where: { id: param.member_id, set_invalid: false },
      transaction,
    });
    const rankList = await user_rank.findOne({
      where: { id: memberRes.member_rank_id, set_invalid: false },
      transaction,
    });

    const new_bal =
      exist.amount + parseFloat(param.total_amount * rankList.point_per_spent);

    const [updatedRowsCount] = await wallet.update(
      { amount: new_bal },
      {
        where: { member_id: param.member_id },
        transaction,
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    await wallet_audit_log("add_wallet_amount", "order_payment_success", {
      order_id: param.id,
      member_id: param.member_id,
      prev_bal: exist?.amount,
      new_bal,
    });

    return success_JSON("", "balance updated");
  } catch (error) {
    console.log("add_wallet_amount error", error);
    await wallet_error_log(
      "add_wallet_amount error",
      "order_payment_success",
      {
        order_id: param.id,
      },
      error
    );

    return fail_JSON("", error.message);
  }
};

// first time bonus upon rank up
const first_time_bonus = async (param, transaction) => {
  try {
    const { wallet, member, wallet_trx } = await model();

    const exist = await wallet.findOne({
      where: { member_id: param.member_id, set_invalid: false },
      attributes,
      transaction,
    });
    const memberRes = await member.findOne({
      where: { id: param.member_id, set_invalid: false },
      transaction,
    });

    const bonus = 1080;
    const new_bal = exist.amount + bonus;

    const [updatedRowsCount] = await wallet.update(
      { amount: new_bal },
      {
        where: { member_id: param.member_id },
        transaction,
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    const newWalletTrx = await wallet_trx.create(
      {
        member_id: param.member_id,
        type: PAYMENT_OPTION.WALLET,
        trx_amount: bonus,
        remark: "Silver bonus point",
        // order_id: param.id,
      },
      { transaction }
    );

    await wallet_audit_log("add_wallet_amount", "first_time_bonus", {
      order_id: param.id,
      member_id: param.member_id,
      prev_bal: exist?.amount,
      new_bal,
    });

    return success_JSON("", "balance updated");
  } catch (error) {
    console.log("add_wallet_amount error", error);
    await wallet_error_log(
      "add_wallet_amount error",
      "first_time_bonus",
      {
        order_id: param.id,
      },
      error
    );

    return fail_JSON("", error.message);
  }
};

const deduct_wallet_point = async (param, transaction) => {
  try {
    const { wallet } = await model();

    const exist = await wallet.findOne({
      where: { member_id: param.member_id, set_invalid: false },
      attributes,
      transaction,
    });
    const new_bal = exist.amount - parseFloat(param.total_point);

    const [updatedRowsCount] = await wallet.update(
      { amount: new_bal },
      {
        where: { member_id: param.member_id },
        transaction,
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    }

    await wallet_audit_log("deduct_wallet_point", "order_payment_success", {
      order_id: param.id,
      member_id: param.member_id,
      prev_bal: exist?.amount,
      new_bal,
    });

    return success_JSON("", "balance updated");
  } catch (error) {
    console.log("deduct_wallet_point error", error);
    await wallet_error_log(
      "deduct_wallet_point error",
      "order_payment_success",
      {
        order_id: param.id,
      },
      error
    );

    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_wallet,
  get_wallet,
  list_wallet,
  update_wallet_amount,
  add_wallet_amount,
  first_time_bonus,
  deduct_wallet_point,
};

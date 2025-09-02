const { MEMBER_ROLE } = require("../../helper/constant");
const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");
const { wallet_error_log, wallet_audit_log } = require("../audit_log");

const attributes = ["id", "member_id", "type", "trx_amount", "order_id"];

const create_wallet_trx = async (param, transaction) => {
  try {
    const { wallet_trx } = await model();

    const newWalletTrx = await wallet_trx.create(
      {
        member_id: param.member_id,
        type: param.payment_option,
        trx_amount: param.total_amount,
        order_id: param.id,
      },
      { transaction }
    );

    return newWalletTrx;
  } catch (error) {
    console.log("create_wallet_trx error", error);
    await wallet_error_log("create_wallet_trx error", member_id, "", error);

    return fail_JSON("", error.message);
  }
};

const list_wallet_trx = async (req) => {
  let where = {};
  if (
    ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(req?.secret?.role_id)
  ) {
    where = { member_id: req?.secret?.id };
  }
  try {
    const { wallet_trx } = await model();

    const result = await wallet_trx.findAll({
      where: { ...where, set_invalid: false },
      attributes,
      order: [["id", "DESC"]], // order by createdAt descending
    });

    return success_JSON(result);
  } catch (error) {
    console.log("list_wallet_trx error", error);
    await wallet_error_log("list_wallet_trx error", member_id, "", error);

    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_wallet_trx,
  list_wallet_trx,
};

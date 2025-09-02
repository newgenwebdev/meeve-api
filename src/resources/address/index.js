const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");
const { member_error_log, member_audit_log } = require("../audit_log");

const attributes = [
  "id",
  "member_id",
  "address_name",
  "address_1",
  "address_2",
  "address_3",
  "postcode",
  "city",
  "state",
  "country",
];

// register new user then create wallet
const create_address = async (req) => {
  const { member_address } = await model();
  const param = req.body;

  try {
    const member_addresss = await member_address.create(param);

    return success_JSON(member_addresss);
  } catch (error) {
    console.log("error", error);
    await member_error_log(
      "create_address error",
      req?.secret?.id,
      param,
      error
    );
    return fail_JSON("", error.message);
  }
};

// done
const get_address = async (req) => {
  const { member_address } = await model();
  const id = +req.params.id;

  try {
    const address = await member_address.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(address);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const list_address = async (req) => {
  const { member_address } = await model();

  try {
    const addresses = await member_address.findAll({
      where: { member_id: req?.secret?.id, set_invalid: false },
      attributes,
    });

    return success_JSON(addresses);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const update_address = async (req) => {
  const { member_address } = await model();

  const id = +req.params.id;
  const param = req.body;
  try {
    const memberAddressToUpdate = await member_address.findOne({
      where: { id, set_invalid: false },
    });

    if (!memberAddressToUpdate) {
      return fail_JSON("", "address not found or invalid!");
    }

    const [is_updated] = await member_address.update(
      param,
      {
        where: { id },
      }
    );

    if (is_updated === 0) {
      return fail_JSON("", "no record updated");
    }

    const updated_member_address = await member_address.findByPk(id, { transaction });

    await member_audit_log("update_address", req?.secret?.id, param, "");

    return success_JSON(updated_member_address, "record updated successfully");
  } catch (error) {
    await member_error_log(
      "update_address error",
      req?.secret?.id,
      { id, ...param },
      error
    );
    return fail_JSON("", error.message);
  }
};

const delete_address = async (req) => {
  const { member_address } = await model();
  const id = +req.params.id;

  try {
    const memberAddressToUpdate = await member_address.findOne({
      where: { id, set_invalid: false },
    });

    if (!memberAddressToUpdate) {
      return fail_JSON("", "address not exist or invalid!");
    }

    const [is_updated] = await member_address.update(
      { set_invalid: true },
      { where: { id } }
    );

    if (is_updated === 0) {
      return fail_JSON("", "fail to delete");
    }

    const updated_member_address = await member_address.findByPk(id, { transaction });


    await member_audit_log("delete_address", req?.secret?.id, { id }, "");

    return success_JSON(updated_member_address, "deleted successfully");
  } catch (error) {
    await member_error_log(
      "delete_address error",
      req?.secret?.id,
      { id },
      error
    );
    return fail_JSON("", error.message);
  }
};

const get_address_by_keyword = async (keyword) => {
  const { member_address } = await model();

  // done
  try {
    const search = `%${keyword}%`; // add % wildcard manually if needed

    const address = await member_address.findAll({
      where: {
        [Op.or]: [
          {
            address_name: {
              [Op.iLike]: search,
            },
          },
          {
            state: {
              [Op.iLike]: search, // need to cast to TEXT in raw
            },
          },
          {
            country: {
              [Op.iLike]: search,
            },
          },
        ],
      },
    });

    return success_JSON(address);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_address,
  get_address,
  list_address,
  update_address,
  delete_address,
  get_address_by_keyword,
};

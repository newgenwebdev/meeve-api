const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");

const attributes = [
  "id",
  "name",
  "desc",
  "weight",
  "price",
  "quantity",
  "payment_gateway_img",
  "payment_gateway_sku",
  "status",
];

// register new user then create wallet
const create_payment_gateway = async (param) => {
  const { sales_payment_gateway } = await model();
  const transaction = await sales_payment_gateway.sequelize.transaction(); // Start transaction

  try {
    if (!sales_payment_gateway) {
      throw new Error("payment_gateway model not properly initialized");
    }

    // Check both SKU and name uniqueness
    const existingBySku = await sales_payment_gateway.findOne({
      where: { payment_gateway_sku: param.payment_gateway_sku },
      transaction,
    });

    const existingByName = await sales_payment_gateway.findOne({
      where: { payment_gateway_name: param.payment_gateway_name },
      transaction,
    });

    if (existingByName) {
      await transaction.rollback();
      return fail_JSON(
        "DUPLICATE_payment_gateway_NAME",
        "payment_gateway name already taken"
      );
    }

    if (existingBySku) {
      await transaction.rollback();
      return fail_JSON(
        "DUPLICATE_payment_gateway_SKU",
        "payment_gateway sku already taken"
      );
    }

    const payment_gateways = await sales_payment_gateway.create(param, {
      transaction,
    });

    // Commit the transaction (save changes)
    await transaction.commit();

    return success_JSON(payment_gateways);
  } catch (error) {
    // Rollback the transaction (undo changes)
    await transaction.rollback();
    console.log("error", error);

    return fail_JSON("", error.message);
  }
};

// done
const get_payment_gateway = async (id) => {
  const { sales_payment_gateway } = await model();

  try {
    if (!sales_payment_gateway) {
      throw new Error("payment_gateway model not properly initialized");
    }

    const payment_gateway = await sales_payment_gateway.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(payment_gateway);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const list_payment_gateway = async () => {
  const { payment_gateway } = await model();

  try {
    const payment_gateways = await payment_gateway.findAll({
      where: { status: 1 },
    });

    return payment_gateways;
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const update_payment_gateway = async (req) => {
  const { sales_payment_gateway } = await model();

  if (!sales_payment_gateway) {
    throw new Error("payment_gateway model not properly initialized");
  }

  const id = +req.params.id;
  const param = req.body;
  try {
    const { sales_payment_gateway } = await model();
    const payment_gatewayToUpdate = await sales_payment_gateway.findOne({
      where: { id, set_invalid: false },
    });

    if (!payment_gatewayToUpdate) {
      return fail_JSON("", "Member not found or invalid!");
    }

    console.log("param", param);
    const [is_updated] = await sales_payment_gateway.update(param, {
      where: { id },
    });

    if (is_updated === 0) {
      return fail_JSON("", "no record updated");
    }

    const updated_payment_gateway = await sales_payment_gateway.findByPk(id, {
      transaction,
    });

    return success_JSON(updated_payment_gateway, "record updated successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const delete_payment_gateway = async (id) => {
  const { sales_payment_gateway } = await model();

  if (!sales_payment_gateway) {
    throw new Error("payment_gateway model not properly initialized");
  }

  try {
    const payment_gatewayToUpdate = await sales_payment_gateway.findOne({
      where: { id, set_invalid: false },
    });

    if (!payment_gatewayToUpdate) {
      return fail_JSON("", "Member not exist or invalid!");
    }

    const [is_updated] = await sales_payment_gateway.update(
      { set_invalid: true },
      { where: { id } }
    );

    if (is_updated === 0) {
      return fail_JSON("", "fail to delete");
    }
    const updated_payment_gateway = await sales_payment_gateway.findByPk(id, {
      transaction,
    });

    return success_JSON(updated_payment_gateway, "deleted successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const get_payment_gateway_by_keyword = async (keyword) => {
  const { sequelize } = await model();

  // done
  try {
    if (!sequelize) {
      throw new Error("Sequelize not properly initialized");
    }

    const rawQuery = `
      SELECT * FROM "sales_payment_gateway"
      WHERE
        "name" ILIKE :search
        OR CAST(price AS TEXT) ILIKE :search
        OR "desc" ILIKE :search
        OR "payment_gateway_sku" ILIKE :search
    `;

    const payment_gateways = await sequelize.query(rawQuery, {
      replacements: { search: `%${keyword}%` },
      type: sequelize.QueryTypes.SELECT,
    });

    return success_JSON(payment_gateways);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_payment_gateway,
  get_payment_gateway,
  list_payment_gateway,
  update_payment_gateway,
  delete_payment_gateway,
  get_payment_gateway_by_keyword,
};

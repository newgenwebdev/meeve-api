const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");

const attributes = ["id", "name", "status"];

// register new user then create wallet
const create_category = async (param) => {
  const { category } = await model();

  try {
    const existingByName = await category.findOne({
      where: { category_name: param.category_name },
      transaction,
    });

    if (existingByName) {
      return fail_JSON(
        "DUPLICATE_category_NAME",
        "category name already taken"
      );
    }

    const categorys = await category.create(param);

    return success_JSON(categorys);
  } catch (error) {
    console.log("error", error);

    return fail_JSON("", error.message);
  }
};

// done
const get_category = async (id) => {
  const { category } = await model();

  try {
    const categoryRes = await category.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(categoryRes);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const list_category = async () => {
  const { category } = await model();

  try {
    const categories = await category.findAll({
      where: { set_invalid: false },
      attributes,
    });

    return success_JSON(categories);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const update_category = async (req) => {
  const id = +req.params.id;
  const param = req.body;
  try {
    const { category } = await model();

    const [is_updated] = await category.update(
      { name: param.name, status: param.status },
      {
        where: { id },
      }
    );

    if (is_updated === 0) {
      return fail_JSON("", "no record updated");
    }

    const updated_category = await category.findByPk(id, { transaction });

    return success_JSON(updated_category, "record updated successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const delete_category = async (req) => {
  const { category } = await model();
  const id = +req.params.id;

  try {
    const [is_updated] = await category.update(
      { set_invalid: true },
      { where: { id } }
    );

    if (is_updated === 0) {
      return fail_JSON("", "fail to delete");
    }

    const updated_category = await category.findByPk(id, { transaction });

    return success_JSON(updated_category, "deleted successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const get_category_by_keyword = async (keyword) => {
  const { sequelize } = await model();

  // done
  try {
    const rawQuery = `
      SELECT * FROM "category"
      WHERE
        "name" ILIKE :search
        OR CAST(price AS TEXT) ILIKE :search
        OR "desc" ILIKE :search
        OR "category_sku" ILIKE :search
    `;

    const categorys = await sequelize.query(rawQuery, {
      replacements: { search: `%${keyword}%` },
      type: sequelize.QueryTypes.SELECT,
    });

    return success_JSON(categorys);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_category,
  get_category,
  list_category,
  update_category,
  delete_category,
  get_category_by_keyword,
};

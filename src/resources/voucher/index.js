const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");
const { MEMBER_ROLE } = require("../../helper/constant");
const { Op } = require('sequelize');


const attributes = [
  "id",
  "name",
  "prefix",
  "code",
  "desc",
  "assigned_member_id",
  "assigned_rank_id",
  "quantity",
  "remark",
  "exp_date",
  "quantity",
  "amount",
  "percentage",
  "discount_type",
  "status",
];

// register new user then create wallet
const create_voucher = async (param, transaction) => {
  const { voucher } = await model();
  const externalTransaction = !!transaction; // Check if transaction was provided externally
  
  if (!externalTransaction) {
    // Create our own transaction if none was provided
    transaction = await voucher.sequelize.transaction();
  }
  
  try {
    if (!voucher) {
      throw new Error('voucher model not properly initialized');
    }

    // Handle both single voucher and array of vouchers
    const voucherArray = Array.isArray(param) ? param : [param];
    
    // Validate all vouchers first (check for duplicates)
    for (const voucher_item of voucherArray) {
      // Check code uniqueness
      const existingByCode = await voucher.findOne({
        where: { code: voucher_item.code , set_invalid: false ,assigned_member_id: voucher_item.assigned_member_id},
        transaction,
      });
      
      if (existingByCode) {
        throw new Error(`Voucher code '${voucher_item.code}' already exists`);
      }
      
      // Check name uniqueness
      const existingByName = await voucher.findOne({
        where: { name: voucher_item.name, set_invalid: false, assigned_member_id: voucher_item.assigned_member_id },
        transaction,
      });
      
      if (existingByName) {
        throw new Error(`Voucher name '${voucher_item.name}' already exists`);
      }
    }
    
    // After validation, create all vouchers
    const createdVouchers = [];
    for (const voucher_item of voucherArray) {
      const newVoucher = await voucher.create(voucher_item, { transaction });
      createdVouchers.push(newVoucher);
    }
    
    // Commit transaction if we created it
    if (!externalTransaction) {
      await transaction.commit();
    }
    
    return success_JSON(createdVouchers);
  } catch (error) {
    // Only rollback if we created the transaction
    if (!externalTransaction) {
      await transaction.rollback();
    }
    console.log("Voucher creation error:", error);
    return fail_JSON("VOUCHER_CREATION_ERROR", error.message);
  }
};

// done
const get_voucher = async (id) => {
  const { voucher } = await model();

  try {
    if (!voucher) {
      throw new Error("voucher model not properly initialized");
    }

    const voucher_detail = await voucher.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(voucher_detail);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// Get vouchers by member_id or rank_id
const get_voucher_by_member = async (req) => {
  const { voucher } = await model();
  console.log("req11111", req);
  const member_id = req;

  try {
    if (!member_id) {
      return fail_JSON({}, "no filter to find");
    }
    let where = {};

    if (member_id) {
      where.assigned_member_id = member_id;
    }

    // if (input.rank_id) {
    //   where.assigned_rank_id = member_id;
    // }

    const vouchers = await voucher.findAll({
      where: { 
        ...where, 
        set_invalid: false,
        discount_type: {
          [Op.ne]: "gift"
        }
      },
      attributes,
      order: [["exp_date", "DESC"]], // Sort by expiry date, earliest first
    });

    return success_JSON(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    return fail_JSON("", error.message);
  }
};

// // Get vouchers by member_id or rank_id
// const get_voucher_by_rank_or_member = async (rank_id, member_id) => {
//   const { voucher, sequelize } = await model();

//   try {
//     if (!voucher) {
//       throw new Error("voucher model not properly initialized");
//     }

//     // Build the where clause with OR condition
//     const whereClause = {
//       [sequelize.Op.and]: [
//         { set_invalid: false },
//         {
//           [sequelize.Op.or]: [],
//         },
//       ],
//     };

//     if (rank_id) {
//       whereClause[sequelize.Op.and][1][sequelize.Op.or].push({
//         assigned_rank_id: rank_id,
//       });
//     }

//     if (member_id) {
//       whereClause[sequelize.Op.and][1][sequelize.Op.or].push({
//         assigned_member_id: member_id,
//       });
//     }

//     // If neither rank_id nor member_id is provided, return empty result
//     if (!rank_id && !member_id) {
//       return success_JSON([]);
//     }

//     const vouchers = await voucher.findAll({
//       where: whereClause,
//       attributes,
//       order: [["exp_date", "DESC"]], // Order by creation date, newest first
//     });

//     return success_JSON(vouchers);
//   } catch (error) {
//     console.error("Error fetching vouchers:", error);
//     return fail_JSON("", error.message);
//   }
// };

// done
const list_voucher = async (req,res) => {
  const { voucher } = await model();
  let where = {};

  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      where = { id: req?.secret?.id };
    }
    const vouchers = await voucher.findAll({
      where: { ...where, set_invalid: false },
      attributes,
    });

    return success_JSON(vouchers);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const update_voucher = async (req) => {
  const { voucher } = await model();

  const id = +req.params.id;
  const param = req.body;
  try {
    const voucherToUpdate = await voucher.findOne({
      where: { id, set_invalid: false },
    });

    if (!voucherToUpdate) {
      return fail_JSON("", "Product not found or invalid!");
    }

    console.log("param", param);
    const [is_updated] = await voucher.update(param, {
      where: { id }
    });

    if (is_updated === 0) {
      return fail_JSON("", "no record updated");
    }

    const updated_voucher = await voucher.findByPk(id, { transaction });

    return success_JSON(updated_voucher, "record updated successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const delete_voucher = async (id) => {

  try {
    const { voucher } = await model();
    const voucherToUpdate = await voucher.findOne({
      where: { id, set_invalid: false },
    });

    if (!voucherToUpdate) {
      return fail_JSON("", "Voucher not exist or invalid!");
    }

    const [is_updated] = await voucher.update(
      { set_invalid: true },
      { where: { id } }
    );

    if (is_updated === 0) {
      return fail_JSON("", "fail to delete");
    }
    const updated_voucher = await voucher.findByPk(id, { transaction });

    return success_JSON(updated_voucher, "deleted successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const delete_voucher_by_member_id = async (id) => {

  try {
    const { voucher } = await model();
    const voucherToUpdate = await voucher.findOne({
      where: { assigned_member_id: id, set_invalid: false },
    });

    if (!voucherToUpdate) {
      return fail_JSON("", "Voucher not exist or invalid!");
    }

    const [is_updated] = await voucher.update(
      { set_invalid: true },
      { where: { assigned_member_id: id } }
    );

    if (is_updated === 0) {
      return fail_JSON("", "fail to delete");
    }

    const updated_voucher = await voucher.findByPk(id, { transaction });

    return success_JSON(updated_voucher, "deleted successfully");
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const get_voucher_by_keyword = async (req) => {
  const { sequelize } = await model();
  const keyword = +req.params.id;

  // done
  try {
    const rawQuery = `
      SELECT * FROM "voucher"
      WHERE
        "name" ILIKE :search
        OR CAST(price AS TEXT) ILIKE :search
        OR "desc" ILIKE :search
        OR "voucher_sku" ILIKE :search
    `;

    const vouchers = await sequelize.query(rawQuery, {
      replacements: { search: `%${keyword}%` },
      type: sequelize.QueryTypes.SELECT,
    });

    return success_JSON(vouchers);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_voucher,
  get_voucher,
  list_voucher,
  update_voucher,
  delete_voucher,
  get_voucher_by_keyword,
  // get_voucher_by_rank_or_member,
  get_voucher_by_member,
  delete_voucher_by_member_id,
};

const {
    password_encryption,
    success_JSON,
    fail_JSON,
    unauthorized_action,
  } = require("../../helper/helper");
  const model = require("../../model");
  const { rank_error_log, rank_audit_log } = require("../audit_log");
  const { MEMBER_RANK } = require("../../helper/constant");
  
  const attributes = [
    "id",
    "name",
    "rate",
    "rank",
    "type",
    "set_invalid"
  ];
  
  // register new user then create wallet
  const create_rank = async (param) => {
    const { user_rank } = await model();
    const transaction = await user_rank.sequelize.transaction(); // Start transaction

    try {
      // Check if username already exists
      const existingrank = await user_rank.findOne({
        where: { name: param.name},
        transaction, // Make sure to check within transaction
      });


      if (existingrank) {
        await transaction.rollback();
        return fail_JSON("DUPLICATE_RANK", "Name already taken");
      }
  
      // not exist then create
      let newRank = await user_rank.create(
        {
          name: param.name,
          rate: param.rate,
          rank: param.rank,
          set_invalid: param.set_invalid,
        },
        { transaction }
      );

      // Commit the transaction (save changes)
      await transaction.commit();
  
      const result = await get_rank(newRank.id);
      
      return success_JSON(result?.data);
    } catch (error) {
      // Rollback the transaction (undo changes)
      await transaction.rollback();
      // console.log("error", error);
  
      return fail_JSON("", error.message);
    }
  };
  
  // done
  const get_rank = async (id) => {
    try {
      const { user_rank } = await model();

      let result = await user_rank.findOne({
        where: { id, set_invalid: false },
        attributes,
      });

      return success_JSON(result);
    } catch (error) {
      await rank_error_log("get_rank error", "", param, error);
  
      return fail_JSON("", error.message);
    }
  };
  
  // done
  const list_rank = async (req, res) => {
    try {
      const { user_rank } = await model();
      let where = {};
      
      if (
        ![MEMBER_RANK.SUPER_ADMIN].includes(
          req?.secret?.rank_id
        )
      ) {
        where = { id: req?.secret?.id};
      }
  
      let result = await user_rank.findAll({
        order: [['rank', 'ASC']], // Sort by rank in ascending order
        where: { ...where, set_invalid: false },
        attributes,
      });
  
      return success_JSON(result);
    } catch (error) {
      console.log("error", error);
      // await rank_error_log("list_rank error", req?.secret?.id || 0, "", error);
  
      return fail_JSON("", error.message);
    }
  };
  
  // done
  const update_rank = async (req) => {
    const id = +req.params.id;
    const param = req.body;
    try {
      const { user_rank } = await model();
      const rankToUpdate = await user_rank.findOne({
        where: { id, set_invalid: false },
      });
  
      if (!rankToUpdate) {
        return fail_JSON("", "rank not found or invalid!");
      }
  
      const [updatedRowsCount, updatedRows] = await user_rank.update(param, {
        where: { id },
      });
  
      if (updatedRowsCount === 0) {
        return fail_JSON("", "no record updated");
      }
      // const updatedData = await get_rank(id);
  
      return success_JSON(updatedRows, "record updated successfully");
    } catch (error) {
  
      return fail_JSON("", error.message);
    }
  };
  
  const delete_rank = async (req) => {
    const id = +req.params.id;
    try {
      if (
        ![MEMBER_RANK.SUPER_ADMIN].includes(
          req?.secret?.rank_id
        )
      ) {
        return unauthorized_action();
      }
      const { user_rank } = await model();
      const rankToDelete = await user_rank.findOne({
        where: { id, set_invalid: false },
      });
  
      if (!rankToDelete) {
        return fail_JSON("", "rank not exist or invalid!");
      }
  
      const [updatedRowsCount, updatedRows] = await user_rank.update(
        { set_invalid: true },
        {
          where: { id },
        }
      );
  
      if (updatedRowsCount === 0) {
        return fail_JSON("", "fail to delete");
      }
  
      return success_JSON(updatedRows, "deleted successfully");
    } catch (error) {
  
      return fail_JSON("", error.message);
    }
  };
  
  module.exports = {
    create_rank,
    get_rank,
    list_rank,
    update_rank,
    delete_rank,
  };
  
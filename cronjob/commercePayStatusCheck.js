const cron = require("node-cron");
const moment = require("moment");
const model = require("../src/model");
const {
  commerce_query_payment,
} = require("../src/resources/intergration/commerce_pay");
const { Op } = require("sequelize");

const commercePayStatusCheck = async () => {
  console.log("commercePayStatusCheck in");
  const { payment_service } = await model();

  const pData = await payment_service.findAll({
    where: {
      state: "init",
      payment_type: 1,
      expired_date: {
        // [Op.gte]: moment(),
        [Op.gte]: moment().add(-8, "hour"), // -8 because in db is utc, local is +8
      },
    },
  });
  console.log("pData", pData);

  for (let i = 0; i < pData.length; i++) {
    await commerce_query_payment(pData[i]);
  }
  // cron.schedule("* * * * *", async () => {

  // });
};

module.exports = commercePayStatusCheck;

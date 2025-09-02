const moment = require("moment");
const { success_JSON, fail_JSON } = require("../../helper/helper");
const model = require("../../model");
const { PAYMENT_GATEWAY_OPTION } = require("../../helper/constant");
const { commerce_request_payment } = require("../intergration/commerce_pay");
const { payment_error_log } = require("../audit_log");

const init_payment_service = async (order, transaction) => {
  const { payment_service } = await model();
  order = order.dataValues;
  let paymentGatewaydata = {};
  try {
    let isRepay = await payment_service.findOne({
      where: { order_id: order.id },
    });
    let paymentResult = isRepay;

    if (!isRepay) {
      // create payment service data
      let amount = 0;
      if (order.payment_type === PAYMENT_GATEWAY_OPTION.COMMERCE_PAY) {
        amount = parseFloat(order.total_amount) * 100; // Please take note: The Amount parameter only accepts integer units. For example, 1000 is equivalent to 10.00 for the backend.
      }
      const param = {
        state: "init",
        order_id: order.id,
        order_amount: amount,
        payment_type: order.payment_type, // payment gateway id
        currency: "MYR",
        country: order.address_details.country,
        member_name: order.member_details.name,
        member_email: order.member_details.email,
        member_contact: order.member_details.contact_no,
        clientIp: order.clientIp || "127.0.0.1",
        expired_date: moment().add("m", process.env.PAYMENT_EXPIRED_MINUTES),
      };
      // console.log("param", param);
      paymentResult = await payment_service.create(param, { transaction });
    }

    // console.log("paymentResult", paymentResult);

    // after get paymentResult call payment gateway

    if (order.payment_type === PAYMENT_GATEWAY_OPTION.COMMERCE_PAY) {
      // console.log("in payment");
      let commercePayRes = await commerce_request_payment(order, transaction);
      // console.log("commercePayRes", commercePayRes);
      if (commercePayRes?.result?.redirectUrl) {
        paymentGatewaydata.redirectUrl = commercePayRes?.result?.redirectUrl;
      }
    }

    return paymentGatewaydata;
  } catch (error) {
    console.log(error);
    await payment_error_log(
      "init_payment_service error",
      order.id,
      order,
      error
    );
  }
};

const update_payment_service = async (order_id, data) => {
  const { payment_service } = await model();

  try {
    const param = {
      state: "paid",
      transaction_date: moment().valueOf(),
      ...data,
    };
    // console.log("param", param);
    paymentResult = await payment_service.update(param, {
      where: { order_id: order_id },
    });
  } catch (error) {
    console.log("update_payment_service error", error);
  }
};

module.exports = {
  init_payment_service,
  update_payment_service,
};

const model = require("../../model");
const { axiosHelper } = require("../../helper/helper");
const { integration_error_log } = require("../audit_log");
const { update_payment_detail_upon_payment_success } = require("../order");
const { create_intergration_order } = require("../intergration");
const { generateHMACSignature } = require("../../helper/commercePayHashing");
const { update_payment_service } = require("../payment");

const commerce_pay_callback = async (req) => {
  const order_id = +req.params.id;
  const {
    amount,
    channelId,
    currencyCode,
    referenceCode,
    status,
    transactionNumber,
    providerTransactionNumber,
  } = req.body;
  const { sales_order } = await model();
  const salesData = await sales_order.findOne({
    where: {
      id: order_id,
    },
  });
  console.log("commerce_pay_callback param--->", req.params);
  console.log("commerce_pay_callback body--->", req.body);

  // let test = {
  //   amount: 100,
  //   channelId: 4,
  //   currencyCode: "MYR",
  //   referenceCode: "string",
  //   status: 1,
  //   transactionNumber: "2005671137F81FD81D89D8",
  //   providerTransactionNumber: "string",
  // };

  // check hashing
  // take result from sales data then do hashing and compare

  // status = 1 means success
  // update payment data
  // update order detail
  // call WMS integration
  if (status === 1) {
    await update_payment_service(order_id, {
      transaction_id: transactionNumber,
      payment_response: req.body,
    });

    await update_payment_detail_upon_payment_success(order_id);

    const responseIntegration = await create_intergration_order(salesData); // create intergration order

    if (responseIntegration.code === 200) {
      const [is_integration_updated] = await sales_order.update(
        {
          delivery_status: SHIPPING_STATUS.INITIATE,
          merchant_order_id: responseIntegration.data.warehouseOrderId,
        },
        {
          where: { id: order_id },
        }
      );
    }
  }
};

module.exports = {
  commerce_pay_callback,
};

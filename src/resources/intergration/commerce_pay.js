const moment = require("moment");
const model = require("../../model");
const { axiosHelper } = require("../../helper/helper");
const { integration_error_log } = require("../audit_log");
const { update_payment_detail_upon_payment_success } = require("../order");
const { create_intergration_order } = require(".");
const { generateHMACSignature } = require("../../helper/commercePayHashing");

// https://staging-payments.commerce.asia/api/TokenAuth/Authenticate

const commerce_get_token_auth = async () => {
  const { payment_config } = await model();

  const pData = await payment_config.findOne({
    where: {
      payment_type: 1,
    },
  });
  try {
    const authResult = await axiosHelper(
      {
        method: "POST",
        url: `${process.env.COMMERCE_PAY}/api/TokenAuth/Authenticate`,
        data: {
          userNameOrEmailAddress: process.env.COMMERCE_PAY_USERNAME,
          password: process.env.COMMERCE_PAY_PASSWORD,
        },
      },
      {
        "Abp-TenantId": pData.merchant_id, // merchant id in merchant detail
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    );

    return authResult?.result?.accessToken;
  } catch (error) {
    console.log("error commerce_get_token_auth", error);
    await integration_error_log(
      "commerce_get_token_auth error",
      order.id,
      order,
      error
    );
  }
};

const commerce_request_payment = async (order, transaction) => {
  const { payment_config, payment_service } = await model();
  const pData = await payment_config.findOne({
    where: {
      payment_type: 1,
    },
  });

  const dateTime = moment().valueOf();

  const accessToken = await commerce_get_token_auth();
  let param = {
    amount: parseFloat(order.total_amount) * 100, // The Amount parameter only accepts integer units. For example, 1000 is equivalent to 10.00 for the backend.
    callbackUrl: `${pData.callback_url}/${order.id}` || "localhost:9990", //,pData.callback_url, // return to API
    currencyCode: "MYR", // Currency code with a 3-letter ISO4217 standard code
    customer: {
      email: order.member_details.email, // string or null
      mobileNo: order.member_details.contact_no, // string or null
      name: order.member_details.name, // string or null
      // username: "string", // string or null
      // identificationNumber: "string", // string, [Conditional for FPX Recurring]
      // identificationType: 1, // integer, Conditional for FPX Recurring. New Identity Number = 1, Old Identity Number = 2, Passport Number = 3, Business Registration = 4, Others = 5
    },
    description: `Payment for order ${order.id}`, // Transaction Description
    ipAddress: order.clientIp || "127.0.0.1", // Customer’s IP address captured by the merchant system
    localCitizen: true, // Conditional for certain channel: Example: If the customer is from Malaysia, kindly set it as True; else, set it as False
    referenceCode: `Payment for order ${order.id}`, // Merchant Reference Code
    returnUrl: `${process.env.FRONTEND_URL}/order-history`, // return to FE page
    savePayment: false,
    timestamp: dateTime, // new Date().getTime() sample value: 1621851652617
    // channelId: 0, // integer<int32> or null
    // providerChannelId: "string", // string or null
    // userAgent: "string", // string or null
    // subMerchant: {
    //   uniqueId: "string", // string or null
    //   name: "string", // string or null
    // },
    // recurringPaymentInfo: {
    //   id: "string", // string or null, Unique ID provided by the merchant to identify a subscription or account for recurring payments
    //   mode: 1, // integer<int32>, Daily = 1, Weekly = 2, Monthly = 3, Yearly = 4
    //   numberOfPayments: 1, // integer<int32> or null, Maximum Recurring Frequency: 999 (Example: Frequency value 1 => 1 day / 1 week / 1 month / 1 year)
    //   effectiveDate: "string", // string or null, Recurring effective start date Format ddMMyyyy (E.g 20122022)
    //   maximumPaymentAmount: 0, // integer<int64> or null, Maximum payment amount of the each recurring payment
    //   expiryDate: "string", // string or null, Recurring expiry date format ddMMyyyy (E.g 20122022)
    //   isFixedAmount: true, // boolean or null, Whether every recurring is a fixed amount or not
    // },
    // requestPaymentExtraInfo: {
    //   channelGroupId: 0, //integer<int32> or null, Optional: Used for displaying selected channel groups on CommercePay hosted payment web
    //   hiddenChannel: null, // array[integer<int32>] or null, Optional: To hide channels on CommercePay hosted payment web
    // }, // [Optional]
    // platformCharge: {
    //   partnerId: "string", // string or null, Unique Id to identify authorized partner
    //   amount: 0, // integer<int64> or null, Platform charge amount.
    // }, // Optional: Only Authorized Partners by CommercePay are allowed to charge platform fees to the merchant
  };

  const authResult = await axiosHelper(
    {
      method: "POST",
      url: `${process.env.COMMERCE_PAY}/api/services/app/PaymentGateway/RequestPayment`,
      data: param,
    },
    {
      "Abp-TenantId": pData.merchant_id, // merchant id in merchant detail
      "cap-signature": generateHMACSignature(
        param,
        pData.merchant_secret,
        `${process.env.COMMERCE_PAY}/api/services/app/PaymentGateway/RequestPayment`
      ), // hashing
      Authorization: `Bearer {${accessToken}}`, // commerce_get_token_auth(), access token result.accessToken
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  );

  console.log(
    "authResult",
    `${process.env.COMMERCE_PAY}/api/services/app/PaymentGateway/RequestPayment`
  );
  console.log(
    "authResult1",
    generateHMACSignature(
      param,
      pData.merchant_secret,
      `${process.env.COMMERCE_PAY}/api/services/app/PaymentGateway/RequestPayment`
    )
  );
  console.log("authResult2", accessToken);
  console.log("authResult3", param);

  if (authResult?.result?.transactionNumber) {
    await payment_service.update(
      {
        transaction_date_created: dateTime,
        transaction_id: authResult?.result?.transactionNumber,
      },
      {
        where: { order_id: order.id },
        transaction,
      }
    );
  }

  return authResult;
};

const commerce_query_payment = async (data) => {
  console.log("commerce_query_payment inn");
  const { payment_config } = await model();
  const pData = await payment_config.findOne({
    where: {
      payment_type: 1,
    },
  });
  const accessToken = await commerce_get_token_auth();
  const urlPath = `${process.env.COMMERCE_PAY}/api/services/app/PaymentGateway/Query`;
  // const param = {
  //   timestamp: transaction_date_created,
  //   paymentId: data.transaction.id,
  // };// open when testing done
  const param = {
    timestamp: 1750869613415,
    paymentId: "2004B8D7E2EE1DE5C61250625",
  }; // to do testing

  const authResult = await axiosHelper(
    {
      method: "GET",
      url: urlPath,
      params: param,
    },
    {
      "cap-signature": generateHMACSignature(
        param,
        pData.merchant_secret,
        urlPath
      ), // hashing
      Authorization: `Bearer {${accessToken}}`, // commerce_get_token_auth(), access token result.accessToken
      "Content-Type": "application/json",
      Accept: "application/json",
    }
  );

  console.log("authResult", authResult);
};

module.exports = {
  commerce_get_token_auth,
  commerce_request_payment,
  commerce_query_payment,
};

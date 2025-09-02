const {
  success_JSON,
  fail_JSON,
  unauthorized_action,
} = require("../../helper/helper");
const model = require("../../model");
const {
  MEMBER_ROLE,
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
  PAYMENT_OPTION,
} = require("../../helper/constant");
const {
  sales_order_error_log,
  sales_order_audit_log,
} = require("../audit_log");
const { Op } = require("sequelize");
const { deduct_product } = require("../product");
const { create_wallet_trx } = require("../wallet_trx");
const { update_member_total_spent, update_member_rank } = require("../member");
const { add_wallet_amount, deduct_wallet_point } = require("../wallet");
const { init_payment_service } = require("../payment");

const attributes = [
  "id",
  "member_id",
  "product_detail",
  "order_status",
  "payment_status",
  "delivery_status",
  "payment_option",
  "payment_type",
  "delivery_fee",
  "payment_gateway_fee",
  "voucher_code",
  "total_weight",
  "order_amount",
  "total_amount",
  "shipping_name",
  "shipping_email",
  "address_details",
  "member_details",
];

// done
const list_order = async (req, res) => {
  try {
    const { sales_order, member } = await model();
    let where = {};

    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      where = { member_id: req?.secret?.id };
    }

    let result = await sales_order.findAll({
      where: { ...where },
      order: [
        ["createdAt", "DESC"],
        ["order_status", "ASC"],
      ],
    });

    return success_JSON(result);
  } catch (error) {
    console.error("Error in list_order:", error);
    return fail_JSON("", error.message);
  }
};

// Create new order
const create_order = async (req) => {
  const { sales_order, sales_product, voucher, user_rank, member_address } =
    await model();
  const transaction = await sales_order.sequelize.transaction(); // Start transaction
  const input = req.body;
  const rankRes = await user_rank.findOne({
    where: { id: req.secret.member_rank_id },
  });
  const productRes = await sales_product.findAll({
    where: {
      id: { [Op.in]: input.product_detail.map((item) => item.product_id) },
      set_invalid: false,
    },
  });

  // Check if all products are available
  if (productRes.length !== input.product_detail.length) {
    await transaction.rollback();
    return fail_JSON("Some products are not available or have been removed");
  }

  // Check stock quantity for each product
  const insufficientStockProducts = [];
  for (let i = 0; i < input.product_detail.length; i++) {
    const requestedProduct = input.product_detail[i];
    const product = productRes.find(
      (p) => p.id === requestedProduct.product_id
    );

    if (product.quantity < requestedProduct.quantity) {
      insufficientStockProducts.push({
        id: product.id,
        name: product.name,
        requested: requestedProduct.quantity,
        available: product.quantity,
      });
    }
  }

  // If any product has insufficient stock, abort the order
  if (insufficientStockProducts.length > 0) {
    return fail_JSON(
      "Insufficient stock for some products",
      insufficientStockProducts
    );
  }

  let productDetail = [];
  let totalWeight = 0;
  let orderAmount = 0;
  let voucherDiscount = 0;
  let totalAmount = 0;
  let totalPoint = 0;
  // console.log("input product detail", input.product_detail);
  for (let i = 0; i < input.product_detail.length; i++) {
    totalWeight += productRes[i].weight * input.product_detail[i].quantity; // quantity from FE = quantity * weight from db
    if (input.payment_option === PAYMENT_OPTION.PAYMENT_GATEWAY) {
      orderAmount += productRes[i].price * input.product_detail[i].quantity; // quantity from FE = quantity * price from db
    }
    if (input.payment_option === PAYMENT_OPTION.WALLET) {
      totalPoint += productRes[i].point * input.product_detail[i].quantity; // quantity from FE = quantity * point from db
    }

    productDetail.push({
      id: productRes[i].id,
      weight: productRes[i].weight,
      price: productRes[i].price,
      point: productRes[i].point,
      product_sku: productRes[i].product_sku,
      quantity: input.product_detail[i].quantity,
    });
  }
  // console.log("productDetail", productDetail);

  // check voucher true, deduct
  // update voucher quantity -1
  if (input?.voucher_code) {
    const voucherRes = await voucher.findOne({
      where: {
        code: input.voucher_code,
        assigned_member_id: input.member_id,
      },
    });

    if (!voucherRes) {
      await transaction.rollback();
      return fail_JSON("", "voucher code not exist");
    }

    await voucher.update(
      { set_invalid: true },
      { where: { id: voucherRes.id }, transaction }
    );

    voucherDiscount = voucherRes.amount;
  }

  // deduct delivery fee

  let rankDiscount = orderAmount * (rankRes.rate / 100); // membership tier to apply rate

  if (input.payment_option === PAYMENT_OPTION.PAYMENT_GATEWAY) {
    orderAmount -= rankDiscount;
    totalAmount = orderAmount + input.delivery_fee - voucherDiscount;
  }
  if (input.payment_option === PAYMENT_OPTION.WALLET) {
    totalAmount = input.delivery_fee;
  }

  let param = {
    member_id: req.secret.id,
    product_detail: productDetail,
    order_status: ORDER_STATUS.ORDER_CREATED, // 1 = pending
    payment_status: PAYMENT_STATUS.NOT_PAID, // 0 = unpaid
    delivery_status: SHIPPING_STATUS.INITIATE, // 1 = not delivered
    payment_option: input.payment_option, // wallet or payment gateway
    payment_type: input.payment_type, // payment gateway id
    delivery_fee: input.delivery_fee,
    payment_gateway_fee: 0,
    voucher_code: input?.voucher_code,
    total_weight: totalWeight,
    order_amount: orderAmount, // product total amount
    total_amount: totalAmount, // total of product + other fee
    total_point: totalPoint,
    shipping_name: input.address_details.address_name,
    shipping_email: req.secret?.email,
    address_details: input.address_details,
    member_details: {
      id: req.secret.id,
      name: req.secret.name,
      username: req.secret.username,
      email: req.secret.email,
      contact_no: req.secret.contact_no,
      role_id: req.secret.role_id,
      member_rank_id: req.secret.member_rank_id,
      total_spend_amount: req.secret.total_spend_amount,
    },
  };

  try {
    // console.log("Creating order with data:", param);
    let order = await sales_order.create(param, { transaction });

    let paymentData = {};
    if (input.payment_option === PAYMENT_OPTION.PAYMENT_GATEWAY) {
      // payment option is payment gateway then check payment type and proceed to init payment
      order.clientIp = req.ip || "127.0.0.1";
      paymentData = await init_payment_service(order, transaction);
    }

    if (input.payment_option === PAYMENT_OPTION.WALLET) {
      order.clientIp = req.ip || "127.0.0.1";
      paymentData = await init_payment_service(order, transaction);
    }

    // Commit the transaction
    await transaction.commit();

    return success_JSON(
      { ...order, ...paymentData },
      "Order created successfully"
    );
  } catch (error) {
    // Rollback the transaction
    await transaction.rollback();

    await sales_order_error_log("create_order", req.secret.id, input, error);
    return fail_JSON("Failed to create order", error.message);
  }
};

// Get order by ID
const get_order = async (id) => {
  const { sales_order } = await model();
  console.log("get_order_detail;", id);
  try {
    if (!sales_order) {
      throw new Error("Order model not properly initialized");
    }

    const order = await sales_order.findOne({
      where: { id },
    });

    if (!order) {
      return fail_JSON("Order not found");
    }
    console.log("order", order);
    return success_JSON(order, "Order retrieved successfully");
  } catch (error) {
    console.error("Error getting order:", error);
    return fail_JSON("Failed to get order", error.message);
  }
};

// Get member orders, remove
const get_member_orders = async (memberId) => {
  const { sales_order } = await model();

  try {
    if (!sales_order) {
      throw new Error("Order model not properly initialized");
    }

    const orders = await sales_order.findAll({
      where: { member_id: memberId },
      order: [["createdAt", "DESC"]],
    });

    return success_JSON(orders, "Member orders retrieved successfully");
  } catch (error) {
    console.error("Error getting member orders:", error);
    return fail_JSON("Failed to get member orders", error.message);
  }
};

// Update order detail
const update_order_detail = async (req) => {
  const { sales_order } = await model();
  const transaction = await sales_order.sequelize.transaction();
  const id = +req.params.id;
  const {
    order_status,
    payment_status,
    delivery_status,
    address_details,
    delivery_fee,
    total_amount,
  } = req.body;

  // if (
  //   [MEMBER_ROLE.CUSTOMER_SUPPORT].includes(req?.secret?.role_id) &&
  //   ![ORDER_STATUS.ORDER_PENDING_CANCEL, ORDER_STATUS.ORDER_CANCELLED].includes(
  //     order_status
  //   )
  // ) {
  //   // if is CS other than pending cancel or cancelled then not authorized
  //   return unauthorized_action();
  // } else
  if (
    ![
      MEMBER_ROLE.CUSTOMER_SUPPORT,
      MEMBER_ROLE.SUPER_ADMIN,
      MEMBER_ROLE.ADMIN,
    ].includes(req?.secret?.role_id)
  ) {
    return unauthorized_action();
  }

  try {
    const orderDetailBeforeUpdate = await sales_order.findOne({
      where: { id },
      transaction,
    }); // get order detail before update to check if payment status is not success to ensure handle payment success 1 time only

    // update order detail
    const [is_updated] = await sales_order.update(
      {
        order_status,
        payment_status,
        delivery_status,
        address_details,
        delivery_fee,
        total_amount,
        paid_date:
          payment_status === PAYMENT_STATUS.PAYMENT_SUCCESS ? new Date() : null,
      },
      {
        where: { id },
        transaction,
      }
    );

    // payment success then deduct stock quantity, add points, add wallet trx, add total purchase, up rank
    if (
      payment_status === PAYMENT_STATUS.PAYMENT_SUCCESS &&
      orderDetailBeforeUpdate.payment_status !== PAYMENT_STATUS.PAYMENT_SUCCESS
    ) {
      await handle_payment_success(id, transaction);
    }

    await transaction.commit();

    await sales_order_audit_log(
      "update_order_detail",
      req.secret.id,
      {
        id,
        ...req.body,
      },
      is_updated
    );

    const updated_order = await sales_order.findByPk(id);

    return success_JSON("Order status updated successfully", updated_order);
  } catch (error) {
    await transaction.rollback();
    await sales_order_error_log(
      "update_order_detail error",
      req.secret.id,
      {
        id,
        ...req.body,
      },
      error
    );
    console.error("Error updating order status:", error);
    return fail_JSON("Failed to update order status", error.message);
  }
};

// for payment to call when payment is success after create order
const update_payment_detail_upon_payment_success = async (id) => {
  const { sales_order } = await model();
  const transaction = await sales_order.sequelize.transaction();
  try {
    // update order detail
    const [is_updated] = await sales_order.update(
      {
        payment_status: PAYMENT_STATUS.PAYMENT_SUCCESS,
      },
      {
        where: { id },
        transaction,
      }
    );

    // payment success then deduct stock quantity, add points, add wallet trx, add total purchase, up rank
    await handle_payment_success(id, transaction);

    // Commit the transaction
    await transaction.commit();

    await sales_order_audit_log(
      "update_payment_detail_upon_payment_success",
      id,
      null,
      is_updated
    );
  } catch (error) {
    await sales_order_error_log(
      "update_payment_detail_upon_payment_success error",
      id,
      null,
      error
    );
  }
};

const handle_payment_success = async (id, transaction) => {
  // payment success then deduct stock quantity, add points, add wallet trx, update total spend
  const { sales_order } = await model();

  const orderRes = await sales_order.findOne({ where: { id } }); // get order detail

  await deduct_product(orderRes, transaction); // not working, deduct stock quantity
  await create_wallet_trx(orderRes, transaction); // add wallet trx

  //  payment option is not wallet only update total spent and add points
  if (orderRes.payment_option !== PAYMENT_OPTION.WALLET) {
    await update_member_total_spent(orderRes, transaction); // add member total spent
    await add_wallet_amount(orderRes, transaction); // add member total spent
  }

  if (orderRes.payment_option === PAYMENT_OPTION.WALLET) {
    await update_member_total_spent(orderRes, transaction); // add member total spent
    await add_wallet_amount(orderRes, transaction); // add member total spent
    await create_wallet_trx(
      {
        member_id: orderRes.member_id,
        payment_option: orderRes.payment_option,
        total_amount: orderRes.total_point,
        id: orderRes.id,
      },
      transaction
    ); // add wallet trx for points
    await deduct_wallet_point(orderRes, transaction);
  }

  await update_member_rank(orderRes, transaction); // check and update member rank base on total spent
};

module.exports = {
  create_order,
  get_order,
  get_member_orders,
  list_order,
  update_order_detail,
  handle_payment_success,
  update_payment_detail_upon_payment_success,
};

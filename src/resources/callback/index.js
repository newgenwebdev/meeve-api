const model = require("../../model");
const { SHIPPING_STATUS } = require("../../helper/constant");
const { success_JSON, fail_JSON } = require("../../helper/helper");
const {
  integration_audit_log,
  integration_error_log,
} = require("../audit_log");

const process_order_status_callback = async (req, res) => {
  const { sales_order } = await model();
  const transaction = await sales_order.sequelize.transaction();
  const { MessageType, Result } = req;

  try {
    let shipping_status = (shipping_status = SHIPPING_STATUS.INITIATE);

    console.log("Result", Result.OrderId);
    console.log("Result", Result.ShipmentStatus);

    if (Result.ShipmentStatus == "Ship") {
      shipping_status = SHIPPING_STATUS.DELIVERING;
    }
    if (Result.ShipmentStatus == "Delivered") {
      shipping_status = SHIPPING_STATUS.DELIVERED;
    }

    console.log("shipping_status", shipping_status);

    const order = await sales_order.findOne({
      where: { merchant_order_id: Result.OrderId },
    });

    if (!order) {
      await integration_error_log(
        "letmestore_order_status_callback_order_not_found",
        null,
        null,
        { MessageType: req.MessageType, Result: req.Result }
      );
      return fail_JSON("Order not found");
    }

    console.log("order", order);
    const [is_updated] = await sales_order.update(
      {
        shipping_details: Result,
        delivery_status: shipping_status,
      },
      {
        where: { id: order.id },
        transaction,
      }
    );

    if (!is_updated) {
      await transaction.rollback();
      return fail_JSON("Order status update failed");
    }

    const updated_order = await member_address.findByPk(id, { transaction });

    await transaction.commit();

    await integration_audit_log(
      "letmestore_order_status_callback",
      null,
      null,
      { MessageType: req.MessageType, Result: req.Result }
    );
    return success_JSON(updated_order, "Order status updated successfully");
  } catch (error) {
    // add log
    await transaction.rollback();
    await integration_error_log(
      "letmestore_order_status_callback_error",
      null,
      null,
      { MessageType: req.MessageType, Result: req.Result }
    );
    return fail_JSON(error.message, "Internal server error");
  }
};

const process_stock_balance_callback = async (req, res) => {
  const { sales_product } = await model();
  const transaction = await sales_product.sequelize.transaction();
  const { MessageType, Result } = req;

  try {
    console.log("Result", Result.ProductSKU);

    const product = await sales_product.findOne({
      where: { product_sku: Result.ProductSKU },
    });

    if (!product) {
      await integration_error_log(
        "letmestore_stock_balance_callback_product_not_found",
        null,
        null,
        { MessageType: req.MessageType, Result: req.Result }
      );
      return fail_JSON("Product not found");
    }

    console.log("product", product);

    const [is_updated] = await sales_product.update(
      { quantity: Result.Quantity },
      {
        where: { id: product.id },
        transaction,
      }
    );

    if (!is_updated) {
      await transaction.rollback();
      return fail_JSON("Product stock balance update failed");
    }

    await transaction.commit();

    await integration_audit_log(
      "letmestore_order_status_callback",
      null,
      null,
      { MessageType: req.MessageType, Result: req.Result }
    );

    const updated_product = await sales_product.findByPk(id, { transaction });

    return success_JSON(
      updated_product,
      "Product stock balance updated successfully"
    );
  } catch (error) {
    await transaction.rollback();

    return fail_JSON(error.message, "Internal server error");
  }
};

module.exports = {
  process_order_status_callback,
  process_stock_balance_callback,
};

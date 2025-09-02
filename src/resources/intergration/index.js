const { MEMBER_ROLE, MEMBER_RANK } = require("../../helper/constant");
const {
  password_encryption,
  success_JSON,
  fail_JSON,
  unauthorized_action,
  generateRandomPassword,
} = require("../../helper/helper");
const { generateCaeSignature } = require("../../helper/caeSignature");
const axios = require("axios");
const model = require("../../model");
const {
  member_error_log,
  member_audit_log,
  integration_error_log,
} = require("../audit_log");
const { create_wallet, first_time_bonus } = require("../wallet");
const { create_voucher } = require("../voucher");
const { delete_voucher_by_member_id } = require("../voucher");
const { sendOrderConfirmation } = require("../../services/emailService");
const { Op } = require("sequelize");

const attributes = [
  "id",
  "name",
  "username",
  "email",
  "contact_no",
  "role_id",
  "member_rank_id",
  "total_spend_amount",
  "set_invalid",
];

// register new user then create wallet
const create_intergration_order = async (param) => {
  try {
    // Log the initial param to understand its structure
    console.log(
      "Initial integration param received:",
      JSON.stringify(param, null, 2)
    );

    // Determine the correct order object to use
    let orderData = param;
    if (Array.isArray(param) && param.length > 0) {
      console.log("Param is an array, using the first element as orderData.");
      orderData = param[0];
    } else if (Array.isArray(param)) {
      console.error("Param is an empty array. Cannot process product_detail.");
      // Handle error appropriately - e.g., return a fail_JSON or throw an error
      return fail_JSON("Invalid order data: received an empty array.");
    }

    // Ensure orderData is an object before proceeding
    if (typeof orderData !== "object" || orderData === null) {
      console.error("orderData is not a valid object:", orderData);
      return fail_JSON("Invalid order data: expected an object.");
    }

    console.log(
      "Effective orderData for processing:",
      JSON.stringify(orderData, null, 2)
    );

    // Now, safely access product_detail and create productList
    let productList = [];
    if (
      Array.isArray(orderData.product_detail) &&
      orderData.product_detail.length > 0
    ) {
      console.log(
        "Mapping orderData.product_detail:",
        JSON.stringify(orderData.product_detail, null, 2)
      );
      productList = orderData.product_detail.map((product) => ({
        quantity: product.quantity,
        sku: product.product_sku,
        unitPrice: product.price,
      }));
    } else {
      console.warn(
        "orderData.product_detail is not a valid array or is empty. productList will be empty."
      );
      // Depending on requirements, you might want to handle this as an error
      // For now, productList will remain an empty array, which might be acceptable if itemList can be empty
    }

    console.log("Generated productList:", JSON.stringify(productList, null, 2));

    const post_data = {
      shopId: 290,
      timestamp: Math.floor(Date.now() / 1000), // Current Unix timestamp
      referenceCode: orderData.id ? orderData.id.toString() : "",
      firstName: orderData.member_details?.name || "",
      lastName: orderData.member_details?.username || "",
      address1:
        orderData.address_details?.address_1 ||
        orderData.address_details?.address1 ||
        "",
      address2:
        orderData.address_details?.address_2 ||
        orderData.address_details?.address2 ||
        "",
      address3:
        orderData.address_details?.address_3 ||
        orderData.address_details?.address3 ||
        "",
      city: orderData.address_details?.city || "",
      postcode: orderData.address_details?.postcode
        ? orderData.address_details.postcode.toString()
        : "",
      state: orderData.address_details?.state || "",
      country: orderData.address_details?.country || "",
      phone: orderData.member_details?.contact_no
        ? orderData.member_details.contact_no.toString()
        : "",
      totalPrice: orderData.total_amount || 0.0,
      description: orderData.description || "", // Assuming description comes from orderData directly
      remarks: orderData.remarks || "", // Assuming remarks comes from orderData directly
      shippingProvider: orderData.shippingProvider || "", // Assuming shippingProvider from orderData
      trackingNumber: orderData.trackingNumber || "", // Assuming trackingNumber from orderData
      documentUrl: orderData.documentUrl || "", // Assuming documentUrl from orderData
      shippingAmount: orderData.delivery_fee || 0.0,
      itemList: productList, // Use the generated productList here
    };

    // Generate CAE signature for authentication
    const signature = generateCaeSignature(
      post_data,
      process.env.CAE_SECRET_KEY,
      "https://stagingapi-ewms.commerce.asia/api/Order/MerchantCreateOrder"
    );

    // Prepare headers for the API call
    const headers = {
      "Content-Type": "application/json",
      "cae-signature": signature,
    };
    const endpoint = "/api/Order/MerchantCreateOrder";

    console.log("Request headers:", headers);
    console.log("Request payload:", post_data);

    // Make the API call
    const response = await axios.post(
      `${process.env.WMS_API_URL}${endpoint}`,
      post_data,
      { headers }
    );

    console.log("response", response);
    console.log("response status", response.status);
    if (response.status !== 200) {
      await integration_error_log(
        "letmestore_api_call_error",
        orderData.id,
        post_data,
        response
      );

      return fail_JSON("Failed to create integration order", response.data);
    }

    try {
      await sendOrderConfirmation(orderData.member_details.email, orderData);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      await integration_error_log(
        "letmestore_email_error",
        orderData.id,
        post_data,
        emailError
      );
      // Don't fail the whole operation if email fails
    }

    return success_JSON(response.data, "Create Integration Order successfully");
  } catch (error) {
    console.error("API Integration error:", error.message);

    if (error.response) {
      console.error("Error response data:", error.response.data);
    }

    // // Log the error to the audit log if needed
    // try {
    //   await member_error_log("create_intergration_order error", "", param, error);
    // } catch (logError) {
    //   console.error("Failed to log error:", logError);
    // }

    await integration_error_log(
      "letmestore_email_error",
      param.id,
      param,
      error.message
    );

    return fail_JSON("Failed to create integration order", error.message);
  }
};

const get_product_list = async (params) => {
  try {
    // Extract parameters
    const { sku, pageSize, pageNumber, shopId } = params;

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (sku) queryParams.append("Sku", sku);
    queryParams.append("PageSize", pageSize || 10);
    queryParams.append("PageNumber", pageNumber || 1);
    queryParams.append("ShopId", shopId);
    queryParams.append("Timestamp", new Date().getTime());

    // Prepare request data for signature generation
    const requestData = {
      Sku: sku || "",
      PageSize: pageSize || 10,
      PageNumber: pageNumber || 1,
      ShopId: shopId,
      Timestamp: new Date().getTime(),
    };

    // Generate signature using the existing function
    const endpoint = "/api/Product/Merchant/GetProductList";
    const signature = generateCaeSignature(
      requestData,
      process.env.CAE_SECRET_KEY,
      `${process.env.WMS_API_URL}${endpoint}`
    );

    // Make API request
    const response = await axios.get(
      `${process.env.WMS_API_URL}${endpoint}?${queryParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          "cae-signature": signature,
        },
      }
    );

    // Process response
    if (response.data && response.status === 200) {
      // Check local inventory status for the returned products
      if (response.data.items && Array.isArray(response.data.items)) {
        const { sales_product } = await model();

        // Get SKUs from response
        const skus = response.data.items.map((item) => item.sku);

        // Get local inventory data
        const localProducts = await sales_product.findAll({
          where: {
            product_sku: { [Op.in]: skus },
            set_invalid: false,
          },
          attributes: ["id", "product_sku", "quantity"],
        });

        // Create lookup by SKU
        const productInventoryMap = {};
        localProducts.forEach((product) => {
          productInventoryMap[product.product_sku] = {
            id: product.id,
            quantity: product.quantity,
            inStock: product.quantity > 0,
          };
        });

        // Enrich response with inventory data
        response.data.items = response.data.items.map((item) => {
          const inventoryInfo = productInventoryMap[item.sku] || {
            quantity: 0,
            inStock: false,
          };
          return {
            ...item,
            inventory: inventoryInfo,
          };
        });
      }

      return success_JSON(response.data, "Product list retrieved successfully");
    } else {
      return fail_JSON("Failed to retrieve product list", response.data);
    }
  } catch (error) {
    console.error("Error retrieving product list:", error);
    return fail_JSON(
      "Error retrieving product list",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = {
  create_intergration_order,
  get_product_list,
};

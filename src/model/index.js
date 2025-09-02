const sequelize = require("../helper/sequelizeHelper");
const { initDatabase } = require("./init");

// Import all models
// member
const member = require("./member");
const member_address = require("./member_address");
const member_audit_log = require("./member_audit_log");
const member_error_log = require("./member_error_log");
// wallet
const wallet = require("./wallet");
const wallet_trx = require("./wallet_trx");
const wallet_audit_log = require("./wallet_audit_log");
const wallet_error_log = require("./wallet_error_log");
// sales order package product
const sales_package = require("./sales_package");
const sales_product = require("./sales_product");
const sales_package_audit_log = require("./sales_package_audit_log");
const sales_package_error_log = require("./sales_package_error_log");
const sales_order = require("./sales_order");
const sales_order_audit_log = require("./sales_order_audit_log");
const sales_order_error_log = require("./sales_order_error_log");
// payment gateway
const payment_gateway = require("./payment_gateway");
const payment_config = require("./payment_config");
const payment_service = require("./payment_service");
const payment_audit_log = require("./payment_audit_log");
const payment_error_log = require("./payment_error_log");
// delivery
const delivery_item_price = require("./delivery_item_price"); // delivery item price based on weight or quantity
const delivery_courier_list = require("./delivery_courier_list");
const delivery_member_list = require("./delivery_member_list"); // member delivery data
const delivery_audit_log = require("./delivery_audit_log");
const delivery_error_log = require("./delivery_error_log");
// voucher
const voucher = require("./voucher");
// banner
const banner = require("./banner");
// Blog
const blog = require("./blog");
const blog_audit_log = require("./blog_audit_log");
const blog_error_log = require("./blog_error_log");

// Workout
const workout = require("./workout");
const workout_audit_log = require("./workout_audit_log");
const workout_error_log = require("./workout_error_log");
// Blood Test Submission
const blood_test_submission = require("./blood_test_submission");
//
const user_role = require("./user_role");
const user_rank = require("./user_rank");
const user_permission = require("./user_permission");
const permission = require("./permission");
const category = require("./category");
const integration_audit_log = require("./integration_audit_log");
const integration_error_log = require("./integration_error_log");

// Initialize models
const models = {
  sequelize,
  // member
  member: member(sequelize),
  member_address: member_address(sequelize),
  member_audit_log: member_audit_log(sequelize),
  member_error_log: member_error_log(sequelize),
  // wallet
  wallet: wallet(sequelize),
  wallet_trx: wallet_trx(sequelize),
  wallet_audit_log: wallet_audit_log(sequelize),
  wallet_error_log: wallet_error_log(sequelize),
  // sales order package product
  sales_package: sales_package(sequelize),
  sales_product: sales_product(sequelize),
  sales_package_audit_log: sales_package_audit_log(sequelize),
  sales_package_error_log: sales_package_error_log(sequelize),
  sales_order: sales_order(sequelize),
  sales_order_audit_log: sales_order_audit_log(sequelize),
  sales_order_error_log: sales_order_error_log(sequelize),
  // payment gateway
  payment_gateway: payment_gateway(sequelize),
  payment_config: payment_config(sequelize),
  payment_service: payment_service(sequelize),
  payment_audit_log: payment_audit_log(sequelize),
  payment_error_log: payment_error_log(sequelize),
  // delivery
  delivery_item_price: delivery_item_price(sequelize),
  delivery_courier_list: delivery_courier_list(sequelize),
  delivery_member_list: delivery_member_list(sequelize),
  delivery_audit_log: delivery_audit_log(sequelize),
  delivery_error_log: delivery_error_log(sequelize),
  //voucher
  voucher: voucher(sequelize),
  // banner
  banner: banner(sequelize),
  //blog
  blog: blog(sequelize),
  blog_audit_log: blog_audit_log(sequelize),
  blog_error_log: blog_error_log(sequelize),
  //workout
  workout: workout(sequelize),
  workout_audit_log: workout_audit_log(sequelize),
  workout_error_log: workout_error_log(sequelize),
  // blood test submission
  blood_test_submission: blood_test_submission(sequelize),
  //
  user_role: user_role(sequelize),
  user_rank: user_rank(sequelize),
  user_permission: user_permission(sequelize),
  permission: permission(sequelize),
  category: category(sequelize),
  integration_audit_log: integration_audit_log(sequelize),
  integration_error_log: integration_error_log(sequelize),
};

// ✅ Fix: Properly export `initTables` alongside `models`
const initTables = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");

    await sequelize.sync({ alter: true });
    console.log("✅ Tables initialized successfully!");

    // Initialize default data
    await initDatabase(models);

    console.log("✅ Default data inserted successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  }
};

initTables();

module.exports = async () => {
  await sequelize.authenticate();

  return models;
};

const model = require("../../model");

const dataFormatter = (action, updateBy, input, output) => {
  // let sample = {
  //   type: "update_member",// api path and etc...
  //   update_by: 3, // id
  //   input_param: {name:'test1'}, // payload
  //   output_param:{id:1, name:'test1'}, // response
  // };
  const formattedOutput = output instanceof Error ? `${output}` : output;

  return {
    type: action,
    log_id: updateBy,
    input_param: JSON.stringify(input),
    output_param: JSON.stringify(formattedOutput),
  };
};

const member_audit_log = async (
  action,
  updateBy,
  input,
  output,
  transaction
) => {
  try {
    const { member_audit_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await member_audit_log.create(data, transaction);
  } catch (error) {
    console.error("An error occurred in member_audit_log", error);
    throw error;
  }
};

const member_error_log = async (action, updateBy, input, output) => {
  try {
    const { member_error_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await member_error_log.create(data);
  } catch (error) {
    console.error("An error occurred in member_audit_log", error);
    throw error;
  }
};

const sales_package_audit_log = async (action, updateBy, input, output) => {
  try {
    const { sales_package_audit_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await sales_package_audit_log.create(data);
  } catch (error) {
    console.error("An error occurred in sales_package_audit_log", error);
    throw error;
  }
};

const sales_package_error_log = async (action, updateBy, input, output) => {
  try {
    const { sales_package_error_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await sales_package_error_log.create(data);
  } catch (error) {
    console.error("An error occurred in sales_package_error_log", error);
    throw error;
  }
};

const sales_order_audit_log = async (action, updateBy, input, output) => {
  try {
    const { sales_order_audit_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await sales_order_audit_log.create(data);
  } catch (error) {
    console.error("An error occurred in sales_order_audit_log", error);
    throw error;
  }
};

const sales_order_error_log = async (action, updateBy, input, output) => {
  try {
    const { sales_order_error_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await sales_order_error_log.create(data);
  } catch (error) {
    console.error("An error occurred in sales_order_error_log", error);
    throw error;
  }
};

const wallet_audit_log = async (action, updateBy, input, output) => {
  try {
    const { wallet_audit_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await wallet_audit_log.create(data);
  } catch (error) {
    console.error("An error occurred in wallet_audit_log", error);
    throw error;
  }
};

const wallet_error_log = async (action, updateBy, input, output) => {
  try {
    const { wallet_error_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await wallet_error_log.create(data);
  } catch (error) {
    console.error("An error occurred in wallet_audit_log", error);
    throw error;
  }
};

const payment_audit_log = async () => {
  try {
  } catch (error) {}
};

const payment_error_log = async () => {
  try {
  } catch (error) {}
};

const delivery_audit_log = async () => {
  try {
  } catch (error) {}
};

const delivery_error_log = async () => {
  try {
  } catch (error) {}
};

const role_audit_log = async () => {
  try {
  } catch (error) {}
};

const role_error_log = async () => {
  try {
  } catch (error) {}
};

const integration_audit_log = async (action, updateBy, input, output) => {
  try {
    const { integration_audit_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await integration_audit_log.create(data);
  } catch (error) {
    console.error("An error occurred in integration_audit_log", error);
    throw error;
  }
};

const integration_error_log = async (action, updateBy, input, output) => {
  try {
    const { integration_error_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await integration_error_log.create(data);
  } catch (error) {
    console.error("An error occurred in integration_audit_log", error);
    throw error;
  }
};

const blog_audit_log = async (action, updateBy, input, output) => {
  try {
    const { blog_audit_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await blog_audit_log.create(data);
  } catch (error) {
    console.error("An error occurred in blog_audit_log", error);
    throw error;
  }
};

const blog_error_log = async (action, updateBy, input, output) => {
  try {
    const { blog_error_log } = await model();
    const data = dataFormatter(action, updateBy, input, output);

    await blog_error_log.create(data);
  } catch (error) {
    console.error("An error occurred in blog_audit_log", error);
    throw error;
  }
};

module.exports = {
  member_audit_log,
  member_error_log,
  sales_package_audit_log,
  sales_package_error_log,
  sales_order_audit_log,
  sales_order_error_log,
  wallet_audit_log,
  wallet_error_log,
  payment_audit_log,
  payment_error_log,
  delivery_audit_log,
  delivery_error_log,
  role_audit_log,
  role_error_log,
  integration_audit_log,
  integration_error_log,
  blog_audit_log,
  blog_error_log,
};

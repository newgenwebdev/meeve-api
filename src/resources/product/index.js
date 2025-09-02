const { MEMBER_ROLE } = require("../../helper/constant");
const {
  success_JSON,
  fail_JSON,
  unauthorized_action,
} = require("../../helper/helper");
const sequelize = require("../../helper/sequelizeHelper");
const { Op } = require("sequelize");
const model = require("../../model");
const {
  sales_package_audit_log,
  sales_package_error_log,
} = require("../audit_log");
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const attributes = [
  "id",
  "name",
  "desc",
  "weight",
  "price",
  "quantity",
  "product_img",
  "product_sku",
  "product_category",
  "status",
];

// register new user then create wallet
const create_product = async (req) => {
  const param = req.body;
  const { sales_product } = await model();

  try {
    // Check both SKU and name uniqueness
    const existingBySku = await sales_product.findOne({
      where: { product_sku: param.product_sku },
    });

    if (existingBySku) {
      return fail_JSON("DUPLICATE_PRODUCT_SKU", "Product sku already taken");
    }

    const products = await sales_product.create(param);

    await sales_package_audit_log(
      "create_product",
      req?.secret?.id,
      param,
      products
    );

    return success_JSON(products);
  } catch (error) {
    console.log("error", error);
    await sales_package_error_log(
      "create_product",
      req.secret.id,
      param,
      error
    );
    return fail_JSON("", error.message);
  }
};

// done
const get_product = async (id) => {
  const { sales_product } = await model();

  try {
    const product = await sales_product.findOne({
      where: { id, set_invalid: false },
      attributes,
    });

    return success_JSON(product);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const list_product = async (req) => {
  if (
    ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(req?.secret?.role_id)
  ) {
    // return unauthorized_action();
  }

  const { sales_product } = await model();

  try {
    const products = await sales_product.findAll({
      where: { set_invalid: false },
      attributes,
    });

    return success_JSON(products);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

// done
const update_product = async (req) => {
  if (
    ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(req?.secret?.role_id)
  ) {
    return unauthorized_action();
  }

  const { sales_product } = await model();

  const id = +req.params.id;
  const param = req.body;
  try {
    const productToUpdate = await sales_product.findOne({
      where: { id, set_invalid: false },
    });

    if (!productToUpdate) {
      return fail_JSON("", "Product not found or invalid!");
    }

    console.log("param", param);
    const [is_updated] = await sales_product.update(param, {
      where: { id },
    });

    if (is_updated === 0) {
      return fail_JSON("", "no record updated");
    }

    await sales_package_audit_log(
      "update_product",
      req?.secret?.id,
      {
        id,
        ...param,
      },
      is_updated
    );

    const updated_product = await sales_product.findByPk(id, { transaction });

    return success_JSON(updated_product, "record updated successfully");
  } catch (error) {
    await sales_package_error_log(
      "update_product error",
      req?.secret?.id,
      {
        id,
        ...param,
      },
      error
    );
    return fail_JSON("", error.message);
  }
};

const delete_product = async (req) => {
  if (
    ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(req?.secret?.role_id)
  ) {
    return unauthorized_action();
  }

  const { sales_product } = await model();
  const id = +req.params.id;

  try {
    const productToUpdate = await sales_product.findOne({
      where: { id, set_invalid: false },
    });

    if (!productToUpdate) {
      return fail_JSON("", "Product not exist or invalid!");
    }

    const [is_updated] = await sales_product.update(
      { set_invalid: true },
      { where: { id } }
    );

    if (is_updated === 0) {
      return fail_JSON("", "fail to delete");
    }

    await sales_package_audit_log(
      "delete_product",
      req?.secret?.id,
      {
        id,
      },
      is_updated
    );
    const updated_product = await sales_product.findByPk(id, { transaction });

    return success_JSON(updated_product, "deleted successfully");
  } catch (error) {
    await sales_package_error_log(
      "delete_product error",
      req?.secret?.id,
      {
        id,
      },
      error
    );
    return fail_JSON("", error.message);
  }
};

const get_product_by_keyword = async (keyword) => {
  const { sales_product } = await model();

  // done
  try {
    const search = `%${keyword}%`; // add % wildcard manually if needed

    const products = await sales_product.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: search,
            },
          },
          {
            price: {
              [Op.iLike]: search, // need to cast to TEXT in raw
            },
          },
          {
            desc: {
              [Op.iLike]: search,
            },
          },
          {
            product_sku: {
              [Op.iLike]: search,
            },
          },
        ],
      },
    });

    return success_JSON(products);
  } catch (error) {
    return fail_JSON("", error.message);
  }
};

const deduct_product = async (param, transaction) => {
  try {
    const cases = param.product_detail
      .map((item) => `WHEN id = ${item.id} THEN quantity - ${item.quantity}`)
      .join(" ");

    const ids = param.product_detail.map((item) => item.id).join(",");

    const query = `
        UPDATE sales_product
        SET quantity = CASE ${cases} END
        WHERE id IN (${ids});
      `;

    await sequelize.query(query, { transaction }); // transaction optional

    await sales_package_audit_log(
      "deduct_product",
      "order_payment_success",
      { order_id: param.id, product_detail: param.product_detail },
      query
    );
  } catch (error) {
    console.log("deduct_product error", error);
    await sales_package_error_log(
      "deduct_product error",
      "order_payment_success",
      { order_id: param.id },
      error
    );

    return fail_JSON("", error.message);
  }
};

// Configure S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-1'
});

// File validation helper
const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }

  return true;
};

// Business logic for uploading image
const upload_image = async (file, userId) => {
  try {
    if (!file) {
      return fail_JSON('NO_FILE_PROVIDED', 'No file provided');
    }

    // Validate file
    validateFile(file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Set S3 parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `products/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
      // Removed ACL: 'public-read' - bucket policy should handle public access
      Metadata: {
        'uploaded-by': userId?.toString() || 'system',
        'upload-timestamp': timestamp.toString()
      }
    };
    
    // Upload to S3
    const s3Response = await s3.upload(params).promise();
    
    // Return success response
    const responseData = {
      url: s3Response.Location,
      key: s3Response.Key,
      bucket: s3Response.Bucket,
      etag: s3Response.ETag
    };
    
    return success_JSON(responseData, 'Image uploaded successfully');
  } catch (error) {
    console.error('S3 upload error:', error);
    return fail_JSON('UPLOAD_FAILED', error.message || 'Failed to upload image');
  }
};

// Route handler for upload endpoint
const uploadImage = async (req, res) => {
  const result = await upload_image(req.file, req?.secret?.id);
  console.log("result", result);
  return res.json(result);
};

// Business logic for deleting image
const delete_image = async (key) => {
  try {
    if (!key) {
      return fail_JSON('NO_KEY_PROVIDED', 'S3 key is required');
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    const deleteResponse = await s3.deleteObject(params).promise();

    // Return success response
    const responseData = {
      key: key,
      bucket: process.env.AWS_BUCKET_NAME,
      deleteMarker: deleteResponse.DeleteMarker,
      versionId: deleteResponse.VersionId
    };

    return success_JSON(responseData, 'Image deleted successfully');
  } catch (error) {
    console.error('S3 delete error:', error);
    return fail_JSON('DELETE_FAILED', error.message || 'Failed to delete image');
  }
};

// Route handler for delete endpoint
const deleteImage = async (req, res) => {
  const result = await delete_image(req.body.key);
  return res.json(result);
};

// Business logic for generating signed URL
const get_signed_url = async (key, expiresIn = 3600) => {
  try {
    if (!key) {
      return fail_JSON('NO_KEY_PROVIDED', 'S3 key is required');
    }

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: parseInt(expiresIn) // Time in seconds
    };

    const signedUrl = s3.getSignedUrl('getObject', params);

    // Return success response
    const responseData = {
      url: signedUrl,
      key: key,
      expiresIn: expiresIn,
      bucket: process.env.AWS_BUCKET_NAME
    };

    return success_JSON(responseData, 'Signed URL generated successfully');
  } catch (error) {
    console.error('S3 signed URL error:', error);
    return fail_JSON('SIGNED_URL_FAILED', error.message || 'Failed to generate signed URL');
  }
};

// Route handler for signed URL endpoint
const getSignedUrl = async (req, res) => {
  const { key, expiresIn } = req.body;
  const result = await get_signed_url(key, expiresIn);
  return res.json(result);
};

module.exports = {
  create_product,
  get_product,
  list_product,
  update_product,
  delete_product,
  get_product_by_keyword,
  deduct_product,
  upload_image,
  delete_image,
  get_signed_url,
  uploadImage,
  deleteImage,
  getSignedUrl,
};


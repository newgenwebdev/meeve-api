const { MEMBER_ROLE, BLOG_CONTENT_TYPE } = require("../../helper/constant");
const {
  success_JSON,
  fail_JSON,
  unauthorized_action,
} = require("../../helper/helper");
const model = require("../../model");
const { param } = require("../../routes/product");
const { blog_error_log, blog_audit_log } = require("../audit_log");

const attributes = [
  "id",
  "member_id",
  "content_type",
  "title",
  "slug",
  "blog_status",
  "author",
  "categories",
  "tags",
  "featured_image",
  "featured_image_alt",
  "body",
  "summary",
  "seo_title",
  "meta_description",
  "set_invalid",
  "updatedAt",
  "createdAt",
];

//Create Blog
const create_blog = async (req) => {
  const { blog } = await model();
  const transaction = await blog.sequelize.transaction();

  try {
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }

    if (!blog) {
      throw new Error("Blog model not properly initialized");
    }

    // TODO: Logic handling is required here before inserting
    console.log(req);
    const param = req?.body;
    param.member_id = req?.secret?.role_id;
    param.author = req?.secret?.name;
    param.slug = param.title.replace(/\s+/g, "-");
    param.content_type = Object.keys(BLOG_CONTENT_TYPE).find(
      (key) => BLOG_CONTENT_TYPE[key] === param.content_type
    );

    param.blog_status = "Published"; //TODO

    const blogs = await blog.create(param, { transaction });

    await transaction.commit();
    return success_JSON(blogs);
  } catch (error) {
    //Rollback transaction
    await transaction.rollback();
    console.log("error", error);
    await blog_error_log(
      "create_blog error",
      req?.secret?.id,
      req?.body,
      error
    );

    return fail_JSON("", error.message);
  }
};

//Update Blog
const update_blog = async (req) => {
  const { blog } = await model();
  const id = +req.params.id;
  const param = req.body;

  try {
    //TODO Should call get member here instead
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }

    if (!blog) {
      throw new Error("Blog model not properly initialized");
    }

    const blogToUpdate = await blog.findOne({
      where: { id, set_invalid: false },
    }); //TODO: set_invalid needed confirmation

    if (!blogToUpdate) {
      return fail_JSON("", "Blog not found or invalid");
    }

    const [updatedRowsCount, updatedRows] = await blog.update(param, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    } //TODO: add error log

    await blog_audit_log(
      "update_blog",
      req?.secret?.id,
      { ...param, id },
      updatedRows
    );

    //TODO: should be no need to refetch data
    return success_JSON();
  } catch (error) {
    await blog_error_log("update_blog error", id, param, error);
    return fail_JSON("", error.message);
  }
};

//Delete Blog
const delete_blog = async (req) => {
  const { blog } = await model();
  const slug = String(req.params.slug);
  const param = req.body;

  try {
    //TODO Should call get member here instead
    console.log("CHECK ROLE", req?.secret);
    if (
      ![MEMBER_ROLE.SUPER_ADMIN, MEMBER_ROLE.ADMIN].includes(
        req?.secret?.role_id
      )
    ) {
      return unauthorized_action();
    }
    if (!blog) {
      throw new Error("Product model not properly initialized");
    }
    const blogToUpdate = await blog.findOne({
      where: { slug: slug, set_invalid: false },
    }); //TODO: set_invalid needed confirmation
    if (!blogToUpdate) {
      return fail_JSON("", "Blog not found or invalid");
    }
    const [updatedRowsCount, updatedRows] = await blog.update(
      { set_invalid: true },
      {
        where: { slug },
      }
    );

    if (updatedRowsCount === 0) {
      return fail_JSON("", "no record updated");
    } //TODO: add error log

    await blog_audit_log(
      "update_blog",
      req?.secret?.id,
      { ...param, slug },
      updatedRows
    );
  } catch (error) {
    console.error("DELETE BLOG ERROR: ", error);
    await blog_error_log("delete_blog error:", slug, param, error);
    return fail_JSON("", error.message);
  }
};

//TODO:Get Blog by slug
const get_blog = async (req) => {
  const { blog } = await model();
  const slug = `${req.params.slug}`;
  const param = req.body;
  console.log("SLIUG:", slug);
  try {
    const result = await blog.findOne({
      where: { slug, set_invalid: false },
      attributes,
    }); //TODO: attribute sanitizing
    return success_JSON(result); //TODO:
  } catch (error) {
    console.log("Get blog error:", error);
    await blog_error_log("get_blog error:", slug, param, error);
    return fail_JSON("", error.message);
  }
};

//TODO:Search Blog
const search_blog = async (req) => {
  const { blog } = await model();
  const id = +req.params.id;
  const param = req.body;
  try {
    // console.log("Fetching"); //TODO REmove
    const result = await blog.findAll({
      where: { set_invalid: false },
      attributes,
      order: [["updatedAt", "DESC"]],
    });
    // console.log(result); //TODO: Remove
    return success_JSON(result); //TODO:
  } catch (error) {
    console.log("blog search error:", error);
    await blog_error_log("search_blog error:", id, param, error);
    return fail_JSON("", error.message);
  }
};

module.exports = {
  create_blog,
  update_blog,
  delete_blog,
  get_blog,
  search_blog,
};

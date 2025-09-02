require("dotenv").config(); // Load environment variables from .env file
const express = require("express"); // Import required modules
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { OAuth2Client } = require("google-auth-library");
const openApiSpec = require("./openapi");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin: true, //"http://localhost:6767", // Allow only frontend origin
    credentials: true, // Allow cookies/auth headers
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const testRoute = require("./src/routes/test");
const voucherRoute = require("./src/routes/voucher");
const productRoute = require("./src/routes/product");
const memberRoute = require("./src/routes/member");
const walletRoute = require("./src/routes/wallet");
const walletTrxRoute = require("./src/routes/wallet_trx");
const addressRoute = require("./src/routes/address");
// const categoryRoute = require("./src/routes/category");
const paymentGatewayRoute = require("./src/routes/payment_gateway");
const loginRoute = require("./src/routes/login");
const roleRoute = require("./src/routes/role");
const rankRoute = require("./src/routes/rank");
const orderRoute = require("./src/routes/order");
const blogRoute = require("./src/routes/blog");
const workoutRoute = require("./src/routes/workout");
const paymentRoute = require("./src/routes/payment");
const bloodTestSubmissionRoute = require("./src/routes/blood_test_submission");
const { get_member_info_by_token } = require("./src/resources/login");
const integrationRoutes = require("./src/routes/integration");
const callbackRoutes = require("./src/routes/callback");

// Set up Scalar API documentation
async function setupScalarDocs() {
  const scalar = await import("@scalar/express-api-reference");
  
  // Create a middleware that serves the OpenAPI spec with dynamic server URL
  app.get("/openapi.json", (req, res) => {
    const dynamicSpec = {
      ...openApiSpec,
      servers: [
        {
          url: `${req.protocol}://${req.get('host')}`,
          description: 'Current server'
        }
      ]
    };
    res.json(dynamicSpec);
  });
  
  app.use(
    "/api-docs",
    scalar.apiReference({
      spec: {
        url: "/openapi.json"
      },
      customCss: `
        .scalar-api-reference {
          --scalar-border-radius: 0.5rem;
          --scalar-color-accent: #3b82f6;
        }
      `,
    }),
  );
}

// Initialize Scalar docs
setupScalarDocs().catch(err => {
  console.error("Failed to initialize Scalar API documentation:", err);
});
//// break ////
const { list_payment_gateway } = require("./src/resources/payment_gateway");
const commercePayStatusCheck = require("./cronjob/commercePayStatusCheck");

app.use(async function (req, res, next) {
  // whitelist
  const allowedIp = process.env.ALLOWED_IP;
  if (
    req.path.startsWith("/api/test") ||
    req.path.startsWith("/api/auth/login") ||
    req.path.startsWith("/api/auth/forgot-password") ||
    req.path.startsWith("/api/auth/reset-password") ||
    req.path.startsWith("/api/auth/google") ||
    req.path.startsWith("/api/member/new") ||
    req.path.startsWith("/api/role/new") ||
    req.path.startsWith("/api/product/list") ||
    // req.path.startsWith("/api/category/list") ||
    req.path.startsWith("/api/payment") ||
    req.path.startsWith("/api/callback") ||
    // req.path.startsWith("/api/blog") || //TODO: Controller Level Permission, Need confirmation from Dantard
    allowedIp.includes(req.ip)
  ) {
    return next();
  }

  const token = req.cookies.token;

  if (!token) {
    // return res.status(401).send({
    //   code: 401,
    //   msg: "No login token provided",
    // });
    console.log("No login token provided");
  } else {
    const member_info = await get_member_info_by_token(req, res, token);

    if (!member_info?.id) {
      return res.status(401).send({
        code: 401,
        msg: "Invalid login token",
      });
    }
    console.log("MEMBERINFO", member_info); //TODO
    req.secret = member_info;
  }

  return next();
});

// Route middleware
app.use("/api/test", testRoute);
app.use("/api/voucher", voucherRoute);
app.use("/api/product", productRoute);
app.use("/api/member", memberRoute);
app.use("/api/wallet", walletRoute);
app.use("/api/wallet/trx", walletTrxRoute);
app.use("/api/address", addressRoute);
// app.use("/api/category", categoryRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/address", addressRoute);
app.use("/api/payment_gateway", paymentGatewayRoute);
app.use("/api/auth", loginRoute);
app.use("/api/role", roleRoute);
app.use("/api/rank", rankRoute);
app.use("/api/order", orderRoute);
app.use("/api/blog", blogRoute);
app.use("/api/workout-program", workoutRoute);
app.use("/api/blood-test-submission", bloodTestSubmissionRoute);
app.use("/api/integration", integrationRoutes);
app.use("/api/callback", callbackRoutes);
// Basic route
// app.get("/", (req, res) => {
//   res.json({
//     message: "Welcome to my Express project!",
//   });
// });

// module.exports = app;

// cronjob use
// list_payment_gateway().then((res) => {
//   if (res.some(({ name }) => name === "Commerce Pay")) {
//     commercePayStatusCheck();
//   }
// });

const startServer = async () => {
  try {
    // await initDatabase();
    console.log("🚀 Database initialized, starting server...");

    // Start Express server after database initialization
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
  }
};

startServer();

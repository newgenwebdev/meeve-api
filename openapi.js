/**
 * OpenAPI/Swagger specification for Meeve API
 * This file documents the implemented endpoints in src/routes/*
 */

const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Meeve API",
    version: "1.0.0",
    description: "Backend API for Meeve application",
    contact: { name: "Thor", email: "thoriq@rethoriq.com" },
  },
  servers: [
    {
      url: process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : process.env.NODE_ENV === "production"
          ? "https://your-production-domain.com"
          : "http://localhost:9990",
      description: "Default server (overridden by /openapi.json)",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "token" },
    },
    requestBodies: {
      ProductImageUpload: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                image: { type: "string", format: "binary" },
              },
              required: ["image"],
            },
          },
        },
      },
      BloodTestFileUpload: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                file: { type: "string", format: "binary" },
              },
              required: ["file"],
            },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          code: { type: "integer", example: 400 },
          msg: { type: "string", example: "Error message" },
          data: { type: "object", nullable: true },
        },
      },
      Success: {
        type: "object",
        properties: {
          code: { type: "integer", example: 200 },
          msg: { type: "string", example: "Success message" },
          data: { type: "object" },
        },
      },
    },
  },
  // Default: most endpoints require cookie token
  security: [{ cookieAuth: [] }],
  paths: {
    // Test
    "/api/test/test_get": {
      get: {
        summary: "Test GET endpoint",
        tags: ["Test"],
        security: [],
        responses: {
          200: {
            description: "OK",
            content: {
              "text/plain": {
                schema: { type: "string", example: "test get ok" },
              },
            },
          },
        },
      },
    },
    "/api/test/test_post": {
      post: {
        summary: "Test POST endpoint",
        tags: ["Test"],
        security: [],
        responses: {
          200: {
            description: "OK",
            content: {
              "text/plain": {
                schema: { type: "string", example: "test post ok" },
              },
            },
          },
        },
      },
    },

    // Authentication
    "/api/auth/login": {
      post: {
        summary: "Login (sets token cookie)",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  password: { type: "string", format: "password" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            headers: {
              "Set-Cookie": {
                description: "token cookie",
                schema: { type: "string" },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify": {
      get: {
        summary: "Verify token and refresh last access",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        summary: "Logout (clears token cookie)",
        tags: ["Authentication"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/auth/google": {
      post: {
        summary: "Google OAuth login",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { idToken: { type: "string" } },
                required: ["idToken"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/auth/forgot-password": {
      post: {
        summary: "Send password reset email",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { email: { type: "string", format: "email" } },
                required: ["email"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        summary: "Reset password using token",
        tags: ["Authentication"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                  newPassword: { type: "string" },
                },
                required: ["token", "newPassword"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Member
    "/api/member/new": {
      post: {
        summary: "Create member",
        tags: ["Member"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  username: { type: "string" },
                  password: { type: "string" },
                  googleData: {
                    type: "object",
                    description:
                      "Optional Google payload to auto-create member",
                  },
                },
                required: ["email", "username"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/member/detail/{id}": {
      get: {
        summary: "Get member by id",
        tags: ["Member"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/member/list": {
      get: {
        summary: "List members",
        tags: ["Member"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/member/update/{id}": {
      post: {
        summary: "Update member",
        tags: ["Member"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/member/delete/{id}": {
      post: {
        summary: "Delete member",
        tags: ["Member"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/member/addresses/{member_id}": {
      get: {
        summary: "Get member addresses",
        tags: ["Member"],
        parameters: [
          {
            name: "member_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/member/update-password/{id}": {
      post: {
        summary: "Update member password",
        tags: ["Member"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { password: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Product
    "/api/product/list": {
      get: {
        summary: "List products",
        tags: ["Product"],
        security: [],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/list-with-signed-urls": {
      get: {
        summary: "List products with signed URLs",
        tags: ["Product"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/detail/{id}": {
      get: {
        summary: "Get product",
        tags: ["Product"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/keyword": {
      post: {
        summary: "Search products by keyword",
        tags: ["Product"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { keyword: { type: "string" } },
                required: ["keyword"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/create": {
      post: {
        summary: "Create product",
        tags: ["Product"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  desc: { type: "string" },
                  weight: { type: "number" },
                  price: { type: "number" },
                  quantity: { type: "integer" },
                  product_img: { type: "string" },
                  product_sku: { type: "string" },
                  product_category: { type: "string" },
                  status: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/update/{id}": {
      post: {
        summary: "Update product",
        tags: ["Product"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/delete/{id}": {
      post: {
        summary: "Delete product",
        tags: ["Product"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/upload-image": {
      post: {
        summary: "Upload product image",
        tags: ["Product"],
        requestBody: { $ref: "#/components/requestBodies/ProductImageUpload" },
        responses: {
          200: {
            description: "Uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/delete-image": {
      post: {
        summary: "Delete product image",
        tags: ["Product"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { key: { type: "string" } },
                required: ["key"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/product/get-signed-url": {
      post: {
        summary: "Get S3 signed URL",
        tags: ["Product"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  key: { type: "string" },
                  expiresIn: { type: "integer", default: 3600 },
                },
                required: ["key"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Voucher
    "/api/voucher/list": {
      get: {
        summary: "List vouchers",
        tags: ["Voucher"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/voucher/detail/{id}": {
      get: {
        summary: "Get voucher",
        tags: ["Voucher"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/voucher/member": {
      post: {
        summary: "Get vouchers for member",
        tags: ["Voucher"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { assigned_member_id: { type: "integer" } },
                required: ["assigned_member_id"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/voucher/keyword": {
      post: {
        summary: "Search vouchers",
        tags: ["Voucher"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { keyword: { type: "string" } },
                required: ["keyword"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/voucher/create": {
      post: {
        summary: "Create voucher",
        tags: ["Voucher"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/voucher/update/{id}": {
      post: {
        summary: "Update voucher",
        tags: ["Voucher"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/voucher/delete/{id}": {
      post: {
        summary: "Delete voucher",
        tags: ["Voucher"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Wallet
    "/api/wallet/new": {
      post: {
        summary: "Create wallet for member",
        tags: ["Wallet"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { member_id: { type: "integer" } },
                required: ["member_id"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/wallet/detail/{id}": {
      get: {
        summary: "Get wallet",
        tags: ["Wallet"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/wallet/list": {
      post: {
        summary: "List wallets",
        tags: ["Wallet"],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/wallet/updateamount/{id}": {
      post: {
        summary: "Update wallet amount",
        tags: ["Wallet"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { amount: { type: "number" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Wallet transactions
    "/api/wallet/trx/list": {
      post: {
        summary: "List wallet transactions",
        tags: ["WalletTrx"],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Address
    "/api/address/list": {
      get: {
        summary: "List addresses",
        tags: ["Address"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/address/detail/{id}": {
      get: {
        summary: "Get address",
        tags: ["Address"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/address/keyword": {
      post: {
        summary: "Search addresses",
        tags: ["Address"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { keyword: { type: "string" } },
                required: ["keyword"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/address/create": {
      post: {
        summary: "Create address",
        tags: ["Address"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/address/update/{id}": {
      post: {
        summary: "Update address",
        tags: ["Address"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/address/delete/{id}": {
      post: {
        summary: "Delete address",
        tags: ["Address"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/address/new": {
      post: {
        summary: "Create address (alt)",
        tags: ["Address"],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Order
    "/api/order/new": {
      post: {
        summary: "Create order",
        tags: ["Order"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_id: { type: "integer" },
                        quantity: { type: "integer" },
                      },
                    },
                  },
                },
                required: ["items"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/order/update/{id}": {
      post: {
        summary: "Update order",
        tags: ["Order"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/order/detail/{id}": {
      get: {
        summary: "Get order",
        tags: ["Order"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/order/list/{memberId}": {
      get: {
        summary: "List member orders",
        tags: ["Order"],
        parameters: [
          {
            name: "memberId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/order/list": {
      get: {
        summary: "List all orders",
        tags: ["Order"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Payment (whitelisted)
    "/api/payment/initiate": {
      post: {
        summary: "Initiate payment",
        tags: ["Payment"],
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Initiated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment/verify/{paymentId}": {
      get: {
        summary: "Verify payment",
        tags: ["Payment"],
        security: [],
        parameters: [
          {
            name: "paymentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment/methods": {
      get: {
        summary: "List payment methods",
        tags: ["Payment"],
        security: [],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment/callback": {
      post: {
        summary: "Payment gateway callback",
        tags: ["Payment"],
        security: [],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Processed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment/status/update/{paymentId}": {
      post: {
        summary: "Update payment status",
        tags: ["Payment"],
        security: [],
        parameters: [
          {
            name: "paymentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { status: { type: "string" } },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment/history/{orderId}": {
      get: {
        summary: "Get payment history for order",
        tags: ["Payment"],
        security: [],
        parameters: [
          {
            name: "orderId",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Payment Gateway
    "/api/payment_gateway/list": {
      get: {
        summary: "List payment gateways",
        tags: ["Payment Gateway"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment_gateway/detail/{id}": {
      get: {
        summary: "Get payment gateway",
        tags: ["Payment Gateway"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment_gateway/keyword": {
      post: {
        summary: "Search payment gateways",
        tags: ["Payment Gateway"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { keyword: { type: "string" } },
                required: ["keyword"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment_gateway/create": {
      post: {
        summary: "Create payment gateway",
        tags: ["Payment Gateway"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment_gateway/update/{id}": {
      post: {
        summary: "Update payment gateway",
        tags: ["Payment Gateway"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/payment_gateway/delete/{id}": {
      post: {
        summary: "Delete payment gateway",
        tags: ["Payment Gateway"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Blog
    "/api/blog": {
      post: {
        summary: "Create blog",
        tags: ["Blog"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blog/update/{slug}": {
      put: {
        summary: "Update blog",
        tags: ["Blog"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blog/delete/{slug}": {
      delete: {
        summary: "Delete blog",
        tags: ["Blog"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blog/post/{slug}": {
      get: {
        summary: "Get blog by slug",
        tags: ["Blog"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blog/search": {
      get: {
        summary: "Search blogs",
        tags: ["Blog"],
        parameters: [],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blog/list": {
      get: {
        summary: "List blogs",
        tags: ["Blog"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Workout Program
    "/api/workout-program": {
      post: {
        summary: "Create workout program",
        tags: ["Workout Program"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/workout-program/{id}": {
      put: {
        summary: "Update workout program",
        tags: ["Workout Program"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete workout program",
        tags: ["Workout Program"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/workout-program/post/{slug}": {
      get: {
        summary: "Get workout by slug",
        tags: ["Workout Program"],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/workout-program/search": {
      get: {
        summary: "Search workout programs",
        tags: ["Workout Program"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/workout-program/list": {
      get: {
        summary: "List workout programs",
        tags: ["Workout Program"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Blood Test Submission
    "/api/blood-test-submission/upload": {
      post: {
        summary: "Upload blood test file",
        tags: ["Blood Test Submission"],
        requestBody: { $ref: "#/components/requestBodies/BloodTestFileUpload" },
        responses: {
          200: {
            description: "Uploaded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/my-submissions": {
      get: {
        summary: "List my submissions",
        tags: ["Blood Test Submission"],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/admin/all": {
      get: {
        summary: "List all submissions (admin)",
        tags: ["Blood Test Submission"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/admin/{submissionId}/status": {
      patch: {
        summary: "Update submission status (admin)",
        tags: ["Blood Test Submission"],
        parameters: [
          {
            name: "submissionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/admin/{submissionId}/diabetes-values": {
      patch: {
        summary: "Update diabetes values (admin)",
        tags: ["Blood Test Submission"],
        parameters: [
          {
            name: "submissionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/admin/diabetes-statistics": {
      get: {
        summary: "Get diabetes statistics (admin)",
        tags: ["Blood Test Submission"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/{submissionId}/file-url": {
      get: {
        summary: "Get file signed URL",
        tags: ["Blood Test Submission"],
        parameters: [
          {
            name: "submissionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/blood-test-submission/admin/{submissionId}": {
      delete: {
        summary: "Delete submission (admin)",
        tags: ["Blood Test Submission"],
        parameters: [
          {
            name: "submissionId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Rank
    "/api/rank/new": {
      post: {
        summary: "Create rank",
        tags: ["Rank"],
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/rank/detail/{id}": {
      get: {
        summary: "Get rank",
        tags: ["Rank"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/rank/list": {
      get: {
        summary: "List ranks",
        tags: ["Rank"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/rank/update/{id}": {
      post: {
        summary: "Update rank",
        tags: ["Rank"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/rank/delete/{id}": {
      post: {
        summary: "Delete rank",
        tags: ["Rank"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Role
    "/api/role/new": {
      post: {
        summary: "Create role",
        tags: ["Role"],
        security: [],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/role/detail/{id}": {
      get: {
        summary: "Get role",
        tags: ["Role"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/role/list": {
      get: {
        summary: "List roles",
        tags: ["Role"],
        responses: {
          200: {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/role/update/{id}": {
      post: {
        summary: "Update role",
        tags: ["Role"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/role/delete/{id}": {
      post: {
        summary: "Delete role",
        tags: ["Role"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Deleted",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Integration
    "/api/integration/create-integration-order": {
      post: {
        summary: "Create integration order",
        tags: ["Integration"],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },

    // Callbacks (webhooks) - whitelisted
    "/api/callback/update-order-status": {
      post: {
        summary: "Order status webhook",
        tags: ["Callback"],
        security: [],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Processed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/callback/update-stock-balance": {
      post: {
        summary: "Stock balance webhook",
        tags: ["Callback"],
        security: [],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Processed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
    "/api/callback/commercepay/{id}": {
      post: {
        summary: "CommercePay callback",
        tags: ["Callback"],
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          content: { "application/json": { schema: { type: "object" } } },
        },
        responses: {
          200: {
            description: "Processed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Success" },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: "Test", description: "Test endpoints" },
    { name: "Authentication", description: "Authentication endpoints" },
    { name: "Member", description: "Member management" },
    { name: "Product", description: "Product management" },
    { name: "Voucher", description: "Voucher management" },
    { name: "Wallet", description: "Wallet operations" },
    { name: "WalletTrx", description: "Wallet transactions" },
    { name: "Address", description: "Member addresses" },
    { name: "Order", description: "Order management" },
    { name: "Payment", description: "Payment operations" },
    { name: "Payment Gateway", description: "Payment gateway config" },
    { name: "Blog", description: "Blog content" },
    { name: "Workout Program", description: "Workout content" },
    {
      name: "Blood Test Submission",
      description: "Blood test files and results",
    },
    { name: "Rank", description: "Rank management" },
    { name: "Role", description: "Role management" },
    { name: "Integration", description: "External integrations" },
    { name: "Callback", description: "Webhook callbacks" },
  ],
};

module.exports = openApiSpec;

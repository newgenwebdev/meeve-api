/**
 * OpenAPI/Swagger specification for Meeve API
 * This file contains the API documentation for all endpoints
 */

const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Meeve API',
    version: '1.0.0',
    description: 'Backend API for Meeve application',
    contact: {
      name: 'Dantard',
      email: 'dev@dantard.com'
    }
  },
  servers: [
    {
      url: 'http://localhost:9990',
      description: 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 400
          },
          msg: {
            type: 'string',
            example: 'Error message'
          },
          data: {
            type: 'object',
            nullable: true
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            example: 200
          },
          msg: {
            type: 'string',
            example: 'Success message'
          },
          data: {
            type: 'object'
          }
        }
      }
    }
  },
  paths: {
    '/api/test/test_get': {
      get: {
        summary: 'Test GET endpoint',
        tags: ['Test'],
        responses: {
          200: {
            description: 'Success',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: 'test get ok'
                }
              }
            }
          }
        }
      }
    },
    '/api/test/test_post': {
      post: {
        summary: 'Test POST endpoint',
        tags: ['Test'],
        responses: {
          200: {
            description: 'Success',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: 'test post ok'
                }
              }
            }
          }
        }
      }
    },
    '/api/member/new': {
      post: {
        summary: 'Create new member',
        tags: ['Member'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  phone: { type: 'string' }
                },
                required: ['name', 'email', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Member created successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' }
                },
                required: ['email', 'password']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                description: 'Authentication token',
                schema: { type: 'string' }
              }
            },
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/auth/google': {
      post: {
        summary: 'Google OAuth authentication',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' }
                },
                required: ['token']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Google auth successful',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      }
    },
    '/api/product/list': {
      get: {
        summary: 'Get list of products',
        tags: ['Product'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Page number'
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Number of items per page'
          }
        ],
        responses: {
          200: {
            description: 'Products retrieved successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      }
    },
    '/api/voucher': {
      get: {
        summary: 'Get vouchers',
        tags: ['Voucher'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Vouchers retrieved successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new voucher',
        tags: ['Voucher'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  discount: { type: 'number' },
                  expiry_date: { type: 'string', format: 'date' }
                },
                required: ['code', 'discount', 'expiry_date']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Voucher created successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      }
    },
    '/api/wallet': {
      get: {
        summary: 'Get wallet information',
        tags: ['Wallet'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Wallet retrieved successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      }
    },
    '/api/order': {
      get: {
        summary: 'Get orders',
        tags: ['Order'],
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create new order',
        tags: ['Order'],
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        product_id: { type: 'integer' },
                        quantity: { type: 'integer' }
                      }
                    }
                  }
                },
                required: ['items']
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Success' }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    { name: 'Test', description: 'Test endpoints' },
    { name: 'Authentication', description: 'Authentication endpoints' },
    { name: 'Member', description: 'Member management' },
    { name: 'Product', description: 'Product management' },
    { name: 'Voucher', description: 'Voucher management' },
    { name: 'Wallet', description: 'Wallet operations' },
    { name: 'Order', description: 'Order management' }
  ]
};

module.exports = openApiSpec;
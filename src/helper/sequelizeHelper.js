const { Sequelize } = require("sequelize");

// Load database config from environment variables
const { DATABASE_URL, DB_DIALECT } = process.env;

// Check if DATABASE_URL is defined
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Create a Sequelize instance
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: DB_DIALECT || "postgres",
  logging: false, // Disable logging for cleaner output
  query: { raw: true },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

// Export the Sequelize instance for use in your models
module.exports = sequelize;

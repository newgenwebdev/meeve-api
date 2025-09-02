const { Sequelize } = require('sequelize');
const path = require('path');

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:QmIxyJYRhEzoaJKiEctDdfNpQLDjkMer@shuttle.proxy.rlwy.net:15809/railway',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    migrationStorageTableName: 'sequelize_meta'
  },
  test: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:test@localhost:5432/test_db',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    migrationStorageTableName: 'sequelize_meta'
  }
};
require('dotenv').config()
const pjson = require('../package.json');
const utils = require('../libs/utils');
const SERVICE_NAME = (process.env.SERVICE_NAME) ? utils.slugify(process.env.SERVICE_NAME) : pjson.name;
const USER_PORT = process.env.USER_PORT || 5111;
const ADMIN_PORT = process.env.ADMIN_PORT || 5222;
const ADMIN_URL = process.env.ADMIN_URL || `http://localhost:${ADMIN_PORT}`;
const ENV = process.env.ENV || "development";
const REDIS_URI = process.env.REDIS_URI || "redis://127.0.0.1:6379";

const MONGO_URI = process.env.MONGO_URI || `mongodb://localhost:27017/${SERVICE_NAME}`;
const LONG_TOKEN_SECRET = process.env.LONG_TOKEN_SECRET || 'long_super_secret_key_123';
const SHORT_TOKEN_SECRET = process.env.SHORT_TOKEN_SECRET || 'short_super_secret_key_123';
const NACL_SECRET = process.env.NACL_SECRET || 'nacl_super_secret_key_123';

// Removed throw Error to allow defaults to work

const config = {
    dotEnv: {
        SERVICE_NAME,
        ENV,
        MONGO_URI,
        REDIS_URI,
        USER_PORT,
        ADMIN_PORT,
        ADMIN_URL,
        LONG_TOKEN_SECRET,
        SHORT_TOKEN_SECRET,
    }
};

module.exports = config;

const {Pool} = require('pg');
/*const pool = new Pool({
    user: 'broker_user',
    host: 'localhost',
    database: 'crypto_broker',
    password: 'divine123',
    port: 5432,
});*/
// If you want to use the DATABASE_URL from .env, uncomment the following lines
// const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // This is important for self-signed certificates
    },
});
module.exports = pool;
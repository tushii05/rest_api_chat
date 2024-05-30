const mysql = require("mysql2/promise");
const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require('dotenv');
dotenv.config();

const db = {};

async function initialize() {
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DB } = process.env;
    const connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_DB}\`;`);
    const sequelize = new Sequelize(DB_DB, DB_USER, DB_PASSWORD, {
        port: DB_PORT,
        host: DB_HOST,
        dialect: "mysql",
        logging: false,
    });
    console.log(`Database connected to -- ${DB_DB}`);

    db.sequelize = sequelize;

    db.User = require('./models/user')(sequelize, DataTypes);

    await sequelize.sync();
}

initialize();

module.exports = db;

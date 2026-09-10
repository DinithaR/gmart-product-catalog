require("dotenv").config();

module.exports = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        pool: {
            // The pool keeps a set of open connections so each query does not reconnect
            min: 2,
            max: 10
        },
        migrations: {
            directory: "./migrations",
            tableName: "knex_migrations"
        },
        seeds: {
            directory: "./seeds"
        }
    }
};
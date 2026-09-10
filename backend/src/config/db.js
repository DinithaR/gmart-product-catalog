const knex = require("knex");
const knexConfig = require("../../knexfile");

// A single Knex instance is created once and shared, so the connection pool is reused
const db = knex(knexConfig.development);

module.exports = db;
/**
 * Creates the users table which stores admin accounts for the catalog system.
 */
exports.up = function (knex) {
    return knex.schema.createTable("users", (table) => {
        table.increments("id").primary();
        table.string("name", 100).notNullable();

        // Email is the login identifier, so it must be unique across all accounts
        table.string("email", 255).notNullable().unique();

        // Stores the bcrypt hash, never the plain password.
        // The column is sized for the 60 character hash with room to spare.
        table.string("password", 255).notNullable();

        table.string("role", 20).notNullable().defaultTo("admin");

        // Adds created_at and updated_at, both defaulting to the current timestamp
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("users");
};
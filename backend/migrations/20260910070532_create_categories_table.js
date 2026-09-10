/**
 * Creates the categories table. Each product belongs to exactly one category.
 */
exports.up = function (knex) {
    return knex.schema.createTable("categories", (table) => {
        table.increments("id").primary();

        // Category names are unique so the same category cannot be created twice
        table.string("name", 100).notNullable().unique();

        table.text("description").nullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("categories");
};
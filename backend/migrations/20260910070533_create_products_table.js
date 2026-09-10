/**
 * Creates the products table with a foreign key to categories.
 * Stock is unsigned so the database itself rejects negative quantities.
 */
exports.up = function (knex) {
    return knex.schema.createTable("products", (table) => {
        table.increments("id").primary();
        table.string("name", 200).notNullable();
        table.text("description").nullable();

        // Decimal is used instead of float because money must be exact.
        // 10 total digits with 2 after the point allows up to 99,999,999.99
        table.decimal("price", 10, 2).notNullable().defaultTo(0);

        // Unsigned enforces the "stock is never below zero" rule at the schema level,
        // in addition to the validation performed in the controller
        table.integer("stock").unsigned().notNullable().defaultTo(0);

        // Must match the unsigned type of categories.id for the foreign key to apply
        table.integer("category_id").unsigned().notNullable();

        table
            .foreign("category_id")
            .references("id")
            .inTable("categories")
            // RESTRICT blocks deleting a category while products still reference it.
            // This is a deliberate choice to prevent products being silently orphaned.
            .onDelete("RESTRICT")
            .onUpdate("CASCADE");

        // These columns are searched and filtered on, so they are indexed
        table.index("name", "idx_products_name");
        table.index("category_id", "idx_products_category_id");

        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists("products");
};
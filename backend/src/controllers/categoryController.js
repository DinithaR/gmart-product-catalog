const db = require("../config/db");

/**
 * Returns all categories with a count of the products assigned to each.
 */
exports.list = async (req, res, next) => {
    try {
        const categories = await db("categories")
            // A left join keeps categories that currently have no products
            .leftJoin("products", "categories.id", "products.category_id")
            .select(
                "categories.id",
                "categories.name",
                "categories.description",
                "categories.created_at",
                "categories.updated_at"
            )
            .count("products.id as product_count")
            .groupBy("categories.id")
            .orderBy("categories.name", "asc");

        res.json({ data: categories });
    } catch (error) {
        next(error);
    }
};

/**
 * Returns a single category by id.
 */
exports.getById = async (req, res, next) => {
    try {
        const category = await db("categories").where({ id: req.params.id }).first();

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
};

/**
 * Creates a new category.
 */
exports.create = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // The name is checked here so a duplicate returns a clear message
        // rather than surfacing the database unique constraint error
        const existing = await db("categories").where({ name: name.trim() }).first();

        if (existing) {
            return res.status(409).json({ message: "A category with this name already exists" });
        }

        const [id] = await db("categories").insert({
            name: name.trim(),
            description: description?.trim() || null
        });

        const created = await db("categories").where({ id }).first();

        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

/**
 * Updates an existing category.
 */
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await db("categories").where({ id }).first();

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: "Category name cannot be empty" });
        }

        if (name && name.trim() !== category.name) {
            // whereNot excludes the current record so a category can keep its own name
            const duplicate = await db("categories")
                .where({ name: name.trim() })
                .whereNot({ id })
                .first();

            if (duplicate) {
                return res.status(409).json({ message: "A category with this name already exists" });
            }
        }

        await db("categories")
            .where({ id })
            .update({
                name: name?.trim() ?? category.name,
                description: description !== undefined ? description?.trim() || null : category.description,
                updated_at: db.fn.now()
            });

        const updated = await db("categories").where({ id }).first();

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

/**
 * Deletes a category. The delete is refused while products are still assigned
 * to it, which keeps products from being orphaned or silently removed.
 */
exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await db("categories").where({ id }).first();

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const [{ count }] = await db("products")
            .where({ category_id: id })
            .count("* as count");

        if (Number(count) > 0) {
            return res.status(409).json({
                message: `This category cannot be deleted because ${count} product(s) are still assigned to it. Reassign or delete those products first.`
            });
        }

        await db("categories").where({ id }).del();

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * Deletes several categories at once. The operation is rejected as a whole
 * if any of the selected categories still has products assigned.
 */
exports.bulkRemove = async (req, res, next) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "A non-empty list of category ids is required" });
        }

        // pluck returns a flat array of values rather than an array of row objects
        const blockedIds = await db("products")
            .whereIn("category_id", ids)
            .distinct("category_id")
            .pluck("category_id");

        if (blockedIds.length > 0) {
            const blockedNames = await db("categories")
                .whereIn("id", blockedIds)
                .pluck("name");

            return res.status(409).json({
                message: `These categories still have products assigned to them: ${blockedNames.join(", ")}`,
                blockedIds
            });
        }

        const deletedCount = await db("categories").whereIn("id", ids).del();

        res.json({ message: `${deletedCount} categor${deletedCount === 1 ? "y" : "ies"} deleted successfully` });
    } catch (error) {
        next(error);
    }
};
const db = require("../config/db");

/**
 * Returns a paginated, searchable list of products including the name of
 * the category each product belongs to.
 */
exports.list = async (req, res, next) => {
    try {
        // Query params arrive as strings and may be missing or invalid,
        // so each one is parsed and clamped to a sensible range
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
        const search = (req.query.search || "").trim();
        const categoryId = req.query.categoryId;
        const offset = (page - 1) * limit;

        // The filters are applied once to a base query so that the count
        // and the page of results are guaranteed to match
        const baseQuery = db("products");

        if (search) {
            baseQuery.where("products.name", "like", `%${search}%`);
        }

        if (categoryId) {
            baseQuery.where("products.category_id", categoryId);
        }

        // clone is required because a knex query builder cannot be executed twice
        const [{ total }] = await baseQuery.clone().count("* as total");

        const data = await baseQuery
            .clone()
            .join("categories", "products.category_id", "categories.id")
            .select(
                "products.id",
                "products.name",
                "products.description",
                "products.price",
                "products.stock",
                "products.category_id",
                "categories.name as category_name",
                "products.created_at",
                "products.updated_at"
            )
            .orderBy("products.created_at", "desc")
            .limit(limit)
            .offset(offset);

        const totalCount = Number(total);

        res.json({
            data,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Returns a single product with its category name.
 */
exports.getById = async (req, res, next) => {
    try {
        const product = await db("products")
            .join("categories", "products.category_id", "categories.id")
            .select("products.*", "categories.name as category_name")
            .where("products.id", req.params.id)
            .first();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

/**
 * Creates a product after validating the payload and confirming the
 * referenced category exists.
 */
exports.create = async (req, res, next) => {
    try {
        const { name, description, price, stock, category_id } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Product name is required" });
        }

        if (price === undefined || price === null || price === "") {
            return res.status(400).json({ message: "Price is required" });
        }

        if (isNaN(Number(price)) || Number(price) < 0) {
            return res.status(400).json({ message: "Price must be a number of zero or more" });
        }

        // Stock is validated here as well as being unsigned in the schema,
        // so the client receives a clear message instead of a database error
        const stockValue = stock === undefined || stock === "" ? 0 : Number(stock);

        if (isNaN(stockValue) || stockValue < 0 || !Number.isInteger(stockValue)) {
            return res.status(400).json({ message: "Stock must be a whole number of zero or more" });
        }

        if (!category_id) {
            return res.status(400).json({ message: "Category is required" });
        }

        const category = await db("categories").where({ id: category_id }).first();

        if (!category) {
            return res.status(400).json({ message: "The selected category does not exist" });
        }

        const [id] = await db("products").insert({
            name: name.trim(),
            description: description?.trim() || null,
            price: Number(price),
            stock: stockValue,
            category_id
        });

        const created = await db("products")
            .join("categories", "products.category_id", "categories.id")
            .select("products.*", "categories.name as category_name")
            .where("products.id", id)
            .first();

        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

/**
 * Updates a product. Only the fields present in the request body are changed.
 */
exports.update = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category_id } = req.body;

        const existing = await db("products").where({ id }).first();

        if (!existing) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: "Product name cannot be empty" });
        }

        if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
            return res.status(400).json({ message: "Price must be a number of zero or more" });
        }

        if (stock !== undefined) {
            const stockValue = Number(stock);

            if (isNaN(stockValue) || stockValue < 0 || !Number.isInteger(stockValue)) {
                return res.status(400).json({ message: "Stock must be a whole number of zero or more" });
            }
        }

        if (category_id !== undefined) {
            const category = await db("categories").where({ id: category_id }).first();

            if (!category) {
                return res.status(400).json({ message: "The selected category does not exist" });
            }
        }

        // The nullish coalescing operator keeps the existing value when a field
        // is absent from the request, which allows partial updates
        await db("products")
            .where({ id })
            .update({
                name: name?.trim() ?? existing.name,
                description: description !== undefined ? description?.trim() || null : existing.description,
                price: price !== undefined ? Number(price) : existing.price,
                stock: stock !== undefined ? Number(stock) : existing.stock,
                category_id: category_id ?? existing.category_id,
                updated_at: db.fn.now()
            });

        const updated = await db("products")
            .join("categories", "products.category_id", "categories.id")
            .select("products.*", "categories.name as category_name")
            .where("products.id", id)
            .first();

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

/**
 * Deletes a product.
 */
exports.remove = async (req, res, next) => {
    try {
        const deletedCount = await db("products").where({ id: req.params.id }).del();

        if (deletedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};
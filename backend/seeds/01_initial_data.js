const bcrypt = require("bcryptjs");

/**
 * Seeds the database with an admin account and a sample product catalog.
 * Existing rows are cleared first so the seed can be run repeatedly.
 */
exports.seed = async function (knex) {
    // Child rows are deleted before parent rows to satisfy the foreign key constraint
    await knex("products").del();
    await knex("categories").del();
    await knex("users").del();

    // A cost factor of 10 balances hashing strength against login response time
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    await knex("users").insert({
        name: "Admin User",
        email: "admin@gmart.com",
        password: passwordHash,
        role: "admin"
    });

    // MySQL returns the id of the first inserted row, so categories are
    // inserted individually to capture each generated id
    const [electronicsId] = await knex("categories").insert({
        name: "Electronics",
        description: "Phones, laptops, tablets and accessories"
    });

    const [appliancesId] = await knex("categories").insert({
        name: "Home Appliances",
        description: "Kitchen and household appliances"
    });

    const [audioId] = await knex("categories").insert({
        name: "Audio",
        description: "Headphones, speakers and audio equipment"
    });

    const [accessoriesId] = await knex("categories").insert({
        name: "Accessories",
        description: "Cables, chargers, cases and peripherals"
    });

    await knex("products").insert([
        { name: "Samsung Galaxy A55", description: "6.6 inch AMOLED, 128GB storage", price: 129000.0, stock: 15, category_id: electronicsId },
        { name: "Apple iPhone 15", description: "128GB, USB-C", price: 315000.0, stock: 7, category_id: electronicsId },
        { name: "Dell Inspiron 15", description: "Core i5, 16GB RAM, 512GB SSD", price: 245000.0, stock: 8, category_id: electronicsId },
        { name: "Lenovo IdeaPad Slim 3", description: "Ryzen 5, 8GB RAM", price: 168000.0, stock: 12, category_id: electronicsId },
        { name: "Samsung Galaxy Tab A9", description: "8.7 inch, 64GB", price: 62000.0, stock: 20, category_id: electronicsId },

        { name: "Philips Air Fryer HD9200", description: "4.1L capacity, rapid air technology", price: 38500.0, stock: 22, category_id: appliancesId },
        { name: "Panasonic Microwave Oven", description: "20L solo microwave", price: 34500.0, stock: 14, category_id: appliancesId },
        { name: "Singer Electric Kettle", description: "1.7L stainless steel", price: 6800.0, stock: 45, category_id: appliancesId },
        { name: "Innovex Rice Cooker", description: "2.8L, non stick inner pot", price: 12400.0, stock: 30, category_id: appliancesId },

        { name: "Sony WH-1000XM5", description: "Wireless noise cancelling headphones", price: 118000.0, stock: 6, category_id: audioId },
        { name: "JBL Flip 6", description: "Portable waterproof bluetooth speaker", price: 42000.0, stock: 18, category_id: audioId },
        { name: "Anker Soundcore Life Q30", description: "Over ear, 40 hour battery", price: 24500.0, stock: 25, category_id: audioId },
        { name: "Samsung Galaxy Buds 2", description: "True wireless earbuds", price: 38000.0, stock: 0, category_id: audioId },

        { name: "Anker PowerPort 65W", description: "Dual port GaN charger", price: 11500.0, stock: 40, category_id: accessoriesId },
        { name: "Logitech MX Master 3S", description: "Wireless performance mouse", price: 32000.0, stock: 9, category_id: accessoriesId },
        { name: "Baseus USB-C Cable 2m", description: "100W fast charging cable", price: 3200.0, stock: 100, category_id: accessoriesId },
        { name: "Spigen Tough Armor Case", description: "Shockproof phone case", price: 5400.0, stock: 55, category_id: accessoriesId },
        { name: "SanDisk Ultra 128GB", description: "microSD card with adapter", price: 7800.0, stock: 33, category_id: accessoriesId }
    ]);
};
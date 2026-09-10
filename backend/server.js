const app = require("./src/app");
const db = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // A trivial query confirms the database is reachable before accepting traffic
        await db.raw("SELECT 1");
        console.log("Database connection established");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to the database:", error.message);
        process.exit(1);
    }
};

startServer();
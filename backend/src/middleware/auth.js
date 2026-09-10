const jwt = require("jsonwebtoken");

/**
 * Verifies the bearer token on incoming requests and attaches the decoded
 * payload to req.user. Requests without a valid token are rejected with 401.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication token is required" });
    }

    // The header format is "Bearer <token>", so the token is the second segment
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Downstream handlers can identify the caller without querying the database
        req.user = decoded;

        next();
    } catch (error) {
        // An expired token is reported separately so the client can prompt a fresh login
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session has expired, please log in again" });
        }

        return res.status(401).json({ message: "Invalid authentication token" });
    }
};

module.exports = authenticate;
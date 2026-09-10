/**
 * Central error handler. Translates known database errors into meaningful
 * status codes and prevents internal details reaching the client.
 */
const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Raised when a delete or update violates a foreign key constraint
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
            message: "This record cannot be modified because other records depend on it"
        });
    }

    // Raised when an insert violates a unique constraint
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ message: "A record with this value already exists" });
    }

    // Raised when a value is out of range for its column type, such as negative stock
    if (err.code === "ER_WARN_DATA_OUT_OF_RANGE") {
        return res.status(400).json({ message: "A supplied value is outside the allowed range" });
    }

    res.status(err.status || 500).json({
        message: err.message || "An unexpected error occurred"
    });
};

module.exports = errorHandler;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Signs a JWT containing the identifying claims for a user.
 * The password hash is deliberately excluded from the payload.
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

/**
 * Registers a new admin account.
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await db("users").where({ email }).first();

        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        // The cost factor of 10 means bcrypt performs 2^10 rounds of key derivation,
        // which is slow enough to resist brute force without delaying legitimate logins
        const hashedPassword = await bcrypt.hash(password, 10);

        const [id] = await db("users").insert({
            name,
            email,
            password: hashedPassword,
            role: "admin"
        });

        const user = { id, name, email, role: "admin" };

        res.status(201).json({ user, token: generateToken(user) });
    } catch (error) {
        next(error);
    }
};

/**
 * Authenticates an existing user and returns a signed token.
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await db("users").where({ email }).first();

        // A single generic message is used for both a missing account and a wrong
        // password so the response does not reveal which emails are registered
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        res.json({ user: safeUser, token: generateToken(safeUser) });
    } catch (error) {
        next(error);
    }
};

/**
 * Returns the currently authenticated user, used by the frontend to restore
 * a session when the page is reloaded with a stored token.
 */
exports.me = async (req, res, next) => {
    try {
        const user = await db("users")
            .select("id", "name", "email", "role")
            .where({ id: req.user.id })
            .first();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};
import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Starts as true so the app can distinguish "not logged in"
    // from "still checking whether the stored token is valid"
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        // The stored token is verified against the server on load,
        // so a page refresh keeps the session without a fresh login
        client
            .get("/auth/me")
            .then((response) => setUser(response.data))
            .catch(() => localStorage.removeItem("token"))
            .finally(() => setLoading(false));
    }, []);

    const login = async (credentials) => {
        const { data } = await client.post("/auth/login", credentials);

        localStorage.setItem("token", data.token);
        setUser(data.user);

        return data.user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    // Throwing here surfaces a clear error if the hook is used
    // outside the provider, instead of a confusing null reference later
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}
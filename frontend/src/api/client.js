import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// A request interceptor attaches the stored token to every outgoing call,
// so individual requests never have to deal with authentication headers
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// A response interceptor clears an expired or invalid session and returns
// the user to the login page rather than leaving the app in a broken state
client.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthError = error.response?.status === 401;
        const isLoginRequest = error.config?.url?.includes("/auth/login");

        // The login endpoint legitimately returns 401 for wrong credentials,
        // so that case is passed through to be handled by the form
        if (isAuthError && !isLoginRequest) {
            localStorage.removeItem("token");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default client;
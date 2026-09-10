import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Nothing is decided until the stored session has been checked
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    // replace avoids adding the blocked page to the browser history,
    // so the back button does not return to a redirect loop
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
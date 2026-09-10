import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Temporary placeholders, replaced in the next phase
function Products() {
    return <h1 className="text-xl font-semibold">Products</h1>;
}

function Categories() {
    return <h1 className="text-xl font-semibold">Categories</h1>;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* The layout is wrapped once, so every page inside it is protected */}
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path="/products" element={<Products />} />
                <Route path="/categories" element={<Categories />} />
            </Route>

            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
    );
}
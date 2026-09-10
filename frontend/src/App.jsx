import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

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
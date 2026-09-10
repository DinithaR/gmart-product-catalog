import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
    const { user, logout } = useAuth();

    // NavLink exposes an isActive flag so the current page can be highlighted
    const linkClass = ({ isActive }) =>
        `px-3 py-2 text-sm font-medium rounded-md ${
            isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
        }`;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-6">
                        <span className="text-lg font-semibold text-gray-900">StockDesk</span>

                        <nav className="flex gap-1">
                            <NavLink to="/products" className={linkClass}>
                                Products
                            </NavLink>
                            <NavLink to="/categories" className={linkClass}>
                                Categories
                            </NavLink>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{user?.email}</span>
                        <button
                            onClick={logout}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            {/* Outlet renders whichever child route is currently matched */}
            <main className="mx-auto max-w-6xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}
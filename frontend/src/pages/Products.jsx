import { useState } from "react";
import { useProducts, useDeleteProduct } from "../hooks/useProducts";
import useDebounce from "../hooks/useDebounce";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

const PAGE_SIZE = 10;

export default function Products() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [actionError, setActionError] = useState("");

    const debouncedSearch = useDebounce(search, 400);

    const { data, isLoading, isFetching, isError, error } = useProducts({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch
    });

    const deleteProduct = useDeleteProduct();

    const handleSearchChange = (event) => {
        setSearch(event.target.value);

        // A new search must start from the first page, otherwise the user
        // can land on a page number that no longer exists in the filtered set
        setPage(1);
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            setActionError("");
            await deleteProduct.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch (err) {
            setActionError(err.response?.data?.message || "Unable to delete this product");
        }
    };

    const formatPrice = (value) =>
        // The mysql driver returns DECIMAL columns as strings to preserve precision,
        // so the value is converted before formatting
        Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2 });

    if (isLoading) {
        return <p className="text-sm text-gray-500">Loading products...</p>;
    }

    if (isError) {
        return (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load products: {error.response?.data?.message || error.message}
            </div>
        );
    }

    const { data: products, pagination } = data;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500">{pagination.total} products</p>
                </div>

                <button
                    onClick={openCreate}
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                    New product
                </button>
            </div>

            <div className="mb-4 flex items-center gap-3">
                <input
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search products by name"
                    className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                />

                {/* isFetching covers background refetches, so the user gets feedback
                    while typing without the whole table being replaced */}
                {isFetching && <span className="text-xs text-gray-400">Updating...</span>}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Category</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">Stock</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    {debouncedSearch
                                        ? `No products match "${debouncedSearch}"`
                                        : "No products yet. Create your first one."}
                                </td>
                            </tr>
                        )}

                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900">{product.name}</div>
                                    {product.description && (
                                        <div className="text-xs text-gray-500">{product.description}</div>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{product.category_name}</td>
                                <td className="px-4 py-3 text-gray-600">Rs. {formatPrice(product.price)}</td>
                                <td className="px-4 py-3">
                                    <span
                                        className={
                                            product.stock === 0
                                                ? "rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                                                : "text-gray-600"
                                        }
                                    >
                                        {product.stock === 0 ? "Out of stock" : product.stock}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => openEdit(product)}
                                        className="mr-3 text-gray-700 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActionError("");
                                            setDeleteTarget(product);
                                        }}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage((previous) => previous - 1)}
                            disabled={page === 1}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((previous) => previous + 1)}
                            disabled={page >= pagination.totalPages}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <ProductFormModal
                open={modalOpen}
                product={editing}
                onClose={() => setModalOpen(false)}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete product"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
                loading={deleteProduct.isPending}
                error={actionError}
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteTarget(null);
                    setActionError("");
                }}
            />
        </div>
    );
}
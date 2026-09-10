import { useState } from "react";
import {
    useCategories,
    useDeleteCategory,
    useBulkDeleteCategories
} from "../hooks/useCategories";
import CategoryFormModal from "../components/CategoryFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Categories() {
    const { data: categories, isLoading, isError, error } = useCategories();

    const deleteCategory = useDeleteCategory();
    const bulkDelete = useBulkDeleteCategories();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [actionError, setActionError] = useState("");

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (category) => {
        setEditing(category);
        setModalOpen(true);
    };

    const toggleSelection = (id) => {
        setSelectedIds((previous) =>
            previous.includes(id)
                ? previous.filter((selectedId) => selectedId !== id)
                : [...previous, id]
        );
    };

    const toggleSelectAll = () => {
        // Selecting all is only meaningful when not everything is already selected
        setSelectedIds(
            selectedIds.length === categories.length ? [] : categories.map((c) => c.id)
        );
    };

    const handleDelete = async () => {
        try {
            setActionError("");
            await deleteCategory.mutateAsync(deleteTarget.id);
            setDeleteTarget(null);
        } catch (err) {
            setActionError(err.response?.data?.message || "Unable to delete this category");
        }
    };

    const handleBulkDelete = async () => {
        try {
            setActionError("");
            await bulkDelete.mutateAsync(selectedIds);
            setSelectedIds([]);
            setBulkConfirmOpen(false);
        } catch (err) {
            setActionError(err.response?.data?.message || "Unable to delete the selected categories");
        }
    };

    if (isLoading) {
        return <p className="text-sm text-gray-500">Loading categories...</p>;
    }

    if (isError) {
        return (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                Failed to load categories: {error.response?.data?.message || error.message}
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500">{categories.length} categories</p>
                </div>

                <div className="flex gap-2">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setBulkConfirmOpen(true)}
                            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                            Delete selected ({selectedIds.length})
                        </button>
                    )}

                    <button
                        onClick={openCreate}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        New category
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                        <tr>
                            <th className="w-10 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={
                                        categories.length > 0 &&
                                        selectedIds.length === categories.length
                                    }
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Description</th>
                            <th className="px-4 py-3 font-medium">Products</th>
                            <th className="px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    No categories yet. Create your first one.
                                </td>
                            </tr>
                        )}

                        {categories.map((category) => (
                            <tr key={category.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(category.id)}
                                        onChange={() => toggleSelection(category.id)}
                                    />
                                </td>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    {category.name}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {category.description || "-"}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    {category.product_count}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => openEdit(category)}
                                        className="mr-3 text-gray-700 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActionError("");
                                            setDeleteTarget(category);
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

            <CategoryFormModal
                open={modalOpen}
                category={editing}
                onClose={() => setModalOpen(false)}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete category"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
                loading={deleteCategory.isPending}
                error={actionError}
                onConfirm={handleDelete}
                onCancel={() => {
                    setDeleteTarget(null);
                    setActionError("");
                }}
            />

            <ConfirmDialog
                open={bulkConfirmOpen}
                title="Delete selected categories"
                message={`Are you sure you want to delete ${selectedIds.length} categor${selectedIds.length === 1 ? "y" : "ies"}? This cannot be undone.`}
                loading={bulkDelete.isPending}
                error={actionError}
                onConfirm={handleBulkDelete}
                onCancel={() => {
                    setBulkConfirmOpen(false);
                    setActionError("");
                }}
            />
        </div>
    );
}
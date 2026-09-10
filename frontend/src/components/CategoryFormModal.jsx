import { useState, useEffect } from "react";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategories";

export default function CategoryFormModal({ open, category, onClose }) {
    const [form, setForm] = useState({ name: "", description: "" });
    const [error, setError] = useState("");

    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const isEditing = Boolean(category);

    // The form is refilled whenever a different category is opened for editing,
    // and cleared when the modal is opened for a new record
    useEffect(() => {
        if (open) {
            setForm({
                name: category?.name || "",
                description: category?.description || ""
            });
            setError("");
        }
    }, [open, category]);

    if (!open) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.name.trim()) {
            setError("Category name is required");
            return;
        }

        try {
            if (isEditing) {
                await updateCategory.mutateAsync({ id: category.id, ...form });
            } else {
                await createCategory.mutateAsync(form);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong, please try again");
        }
    };

    const submitting = createCategory.isPending || updateCategory.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {isEditing ? "Edit category" : "New category"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            placeholder="Electronics"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
                            placeholder="Optional description"
                        />
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                        >
                            {submitting ? "Saving..." : isEditing ? "Save changes" : "Create category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
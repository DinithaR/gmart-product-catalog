import { useState, useEffect } from "react";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: ""
};

export default function ProductFormModal({ open, product, onClose }) {
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState("");

    // The dropdown options come from the same cached categories query
    // used by the categories page, so no extra request is made
    const { data: categories, isLoading: categoriesLoading } = useCategories();

    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const isEditing = Boolean(product);

    useEffect(() => {
        if (open) {
            setForm(
                product
                    ? {
                          name: product.name || "",
                          description: product.description || "",
                          price: product.price ?? "",
                          stock: product.stock ?? "",
                          category_id: product.category_id ?? ""
                      }
                    : emptyForm
            );
            setError("");
        }
    }, [open, product]);

    if (!open) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
        setError("");
    };

    const validate = () => {
        if (!form.name.trim()) return "Product name is required";
        if (form.price === "" || isNaN(Number(form.price))) return "Enter a valid price";
        if (Number(form.price) < 0) return "Price cannot be negative";
        if (form.stock === "" || isNaN(Number(form.stock))) return "Enter a valid stock quantity";
        if (Number(form.stock) < 0) return "Stock cannot be negative";
        if (!Number.isInteger(Number(form.stock))) return "Stock must be a whole number";
        if (!form.category_id) return "Please select a category";
        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        // Numeric fields are sent as numbers rather than the strings
        // that form inputs always produce
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            category_id: Number(form.category_id)
        };

        try {
            if (isEditing) {
                await updateProduct.mutateAsync({ id: product.id, ...payload });
            } else {
                await createProduct.mutateAsync(payload);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong, please try again");
        }
    };

    const submitting = createProduct.isPending || updateProduct.isPending;
    const inputClass =
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {isEditing ? "Edit product" : "New product"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input id="name" name="name" value={form.name} onChange={handleChange} className={inputClass} />
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
                            rows={2}
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="mb-1 block text-sm font-medium text-gray-700">
                                Price (Rs.)
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="stock" className="mb-1 block text-sm font-medium text-gray-700">
                                Stock
                            </label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={form.stock}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="category_id" className="mb-1 block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            disabled={categoriesLoading}
                            className={inputClass}
                        >
                            <option value="">
                                {categoriesLoading ? "Loading categories..." : "Select a category"}
                            </option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
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
                            {submitting ? "Saving..." : isEditing ? "Save changes" : "Create product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
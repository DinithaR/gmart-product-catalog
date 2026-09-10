export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Delete",
    loading = false,
    error = "",
    onConfirm,
    onCancel
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>

                {/* Server errors such as a blocked delete are shown inside the dialog
                    so the user sees why the action failed without losing context */}
                {error && (
                    <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {loading ? "Working..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
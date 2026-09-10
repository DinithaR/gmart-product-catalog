import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

// The key is defined once so every query and invalidation refers to the same cache entry
export const CATEGORIES_KEY = ["categories"];

/**
 * Fetches all categories with their product counts.
 */
export function useCategories() {
    return useQuery({
        queryKey: CATEGORIES_KEY,
        queryFn: async () => {
            const { data } = await client.get("/categories");
            return data.data;
        }
    });
}

/**
 * Creates a category and refreshes the cached list on success.
 */
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.post("/categories", payload);
            return data;
        },
        onSuccess: () => {
            // Invalidating marks the cached list as stale so it refetches,
            // which keeps the server as the single source of truth
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
        }
    });
}

/**
 * Updates a category and refreshes the cached list on success.
 */
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }) => {
            const { data } = await client.put(`/categories/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
        }
    });
}

/**
 * Deletes a single category.
 */
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.delete(`/categories/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
        }
    });
}

/**
 * Deletes several categories in one request.
 */
export function useBulkDeleteCategories() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ids) => {
            const { data } = await client.post("/categories/bulk-delete", { ids });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
        }
    });
}
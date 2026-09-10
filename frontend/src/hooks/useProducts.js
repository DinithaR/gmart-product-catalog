import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

/**
 * Fetches a page of products. Every parameter is part of the query key,
 * so each page and search term is cached separately.
 */
export function useProducts({ page, limit, search }) {
    return useQuery({
        queryKey: ["products", { page, limit, search }],
        queryFn: async () => {
            const { data } = await client.get("/products", {
                params: { page, limit, search }
            });
            return data;
        },
        // The previous page stays visible while the next one loads,
        // which avoids the table collapsing between pages
        placeholderData: (previousData) => previousData
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload) => {
            const { data } = await client.post("/products", payload);
            return data;
        },
        onSuccess: () => {
            // Every cached page is invalidated because a new product
            // can change the contents of any of them
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payload }) => {
            const { data } = await client.put(`/products/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await client.delete(`/products/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        }
    });
}
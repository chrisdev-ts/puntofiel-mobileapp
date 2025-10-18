// Configuración del cliente de TanStack Query para la aplicación.
// Este cliente maneja el caching, revalidación y estado de las queries.

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Configuración por defecto para queries (lecturas)
			staleTime: 1000 * 60 * 5, // 5 minutos
			gcTime: 1000 * 60 * 10, // 10 minutos (antes cacheTime)
			retry: 1, // Reintentar una vez en caso de error
			refetchOnWindowFocus: false, // No refetch automático al cambiar de ventana en mobile
		},
		mutations: {
			// Configuración por defecto para mutations (escrituras)
			retry: 0, // No reintentar mutaciones fallidas automáticamente
		},
	},
});

import { useQuery } from "@tanstack/react-query";
import type { Business, BusinessCategory } from "@/src/core/entities/Business";
import { supabase } from "@/src/infrastructure/services/supabase";
import { useAuth } from "./useAuth";

interface BusinessSearchFilters {
	category?: BusinessCategory;
	searchQuery?: string;
	limit?: number;
}

/**
 * Obtiene todos los negocios con filtros opcionales
 */
async function fetchAllBusinesses(
	filters: BusinessSearchFilters = {},
): Promise<Business[]> {
	let query = supabase
		.from("businesses")
		.select("*")
		.order("created_at", { ascending: false });

	// Filtro de categoría
	if (filters.category) {
		query = query.eq("category", filters.category);
	}

	// Filtro de búsqueda por nombre
	if (filters.searchQuery) {
		query = query.ilike("name", `%${filters.searchQuery}%`);
	}

	// Limitar resultados
	if (filters.limit) {
		query = query.limit(filters.limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error("Error obteniendo negocios:", error);
		throw new Error(`Error al obtener negocios: ${error.message}`);
	}

	return (
		data?.map((row) => ({
			id: row.id,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
			ownerId: row.owner_id,
			name: row.name,
			category: row.category as BusinessCategory,
			locationAddress: row.location_address || undefined,
			openingHours: row.opening_hours || undefined,
			logoUrl: row.logo_url || undefined,
		})) || []
	);
}

/**
 * Obtiene negocios donde el usuario tiene tarjeta de fidelidad
 */
async function fetchFavoriteBusinesses(
	customerId: string,
): Promise<Business[]> {
	const { data, error } = await supabase
		.from("loyalty_cards")
		.select(
			`
      business_id,
      businesses (*)
    `,
		)
		.eq("customer_id", customerId);

	if (error) {
		console.error("Error obteniendo negocios favoritos:", error);
		throw new Error(`Error al obtener negocios favoritos: ${error.message}`);
	}

	return (
		data
			?.map((row) => {
				const business = row.businesses as unknown as {
					id: string;
					created_at: string;
					updated_at: string;
					owner_id: string;
					name: string;
					category: BusinessCategory;
					location_address?: string;
					opening_hours?: string;
					logo_url?: string;
				};

				return {
					id: business.id,
					createdAt: new Date(business.created_at),
					updatedAt: new Date(business.updated_at),
					ownerId: business.owner_id,
					name: business.name,
					category: business.category,
					locationAddress: business.location_address || undefined,
					openingHours: business.opening_hours || undefined,
					logoUrl: business.logo_url || undefined,
				};
			})
			.filter(Boolean) || []
	);
}

/**
 * Obtiene negocios más populares (por cantidad de loyalty cards)
 */
async function fetchPopularBusinesses(limit = 10): Promise<Business[]> {
	// Primero obtenemos los IDs de negocios más populares
	const { data: popularIds, error: countError } = await supabase
		.from("loyalty_cards")
		.select("business_id")
		.limit(1000); // Límite razonable para contar

	if (countError) {
		throw new Error(`Error contando popularidad: ${countError.message}`);
	}

	// Contar ocurrencias de cada business_id
	const businessCounts = popularIds?.reduce(
		(acc, { business_id }) => {
			acc[business_id] = (acc[business_id] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	// Ordenar por popularidad y tomar los top IDs
	const topBusinessIds = Object.entries(businessCounts || {})
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit)
		.map(([id]) => id);

	if (topBusinessIds.length === 0) {
		return [];
	}

	// Obtener los negocios completos
	const { data, error } = await supabase
		.from("businesses")
		.select("*")
		.in("id", topBusinessIds);

	if (error) {
		throw new Error(`Error obteniendo negocios populares: ${error.message}`);
	}

	return (
		data?.map((row) => ({
			id: row.id,
			createdAt: new Date(row.created_at),
			updatedAt: new Date(row.updated_at),
			ownerId: row.owner_id,
			name: row.name,
			category: row.category as BusinessCategory,
			locationAddress: row.location_address || undefined,
			openingHours: row.opening_hours || undefined,
			logoUrl: row.logo_url || undefined,
		})) || []
	);
}

/**
 * Hook para obtener todos los negocios
 */
export function useAllBusinesses(filters: BusinessSearchFilters = {}) {
	return useQuery({
		queryKey: ["businesses", "all", filters],
		queryFn: () => fetchAllBusinesses(filters),
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
}

/**
 * Hook para obtener negocios favoritos del usuario
 */
export function useFavoriteBusinesses() {
	const { user } = useAuth();
	const customerId = user?.id;

	return useQuery({
		queryKey: ["businesses", "favorites", customerId],
		queryFn: () => fetchFavoriteBusinesses(customerId as string),
		enabled: !!customerId,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
}

/**
 * Hook para obtener negocios más populares
 */
export function usePopularBusinesses(limit = 10) {
	return useQuery({
		queryKey: ["businesses", "popular", limit],
		queryFn: () => fetchPopularBusinesses(limit),
		staleTime: 1000 * 60 * 10, // 10 minutos
	});
}

/**
 * Hook para obtener negocios cercanos
 * TODO: Implementar cuando se agregue geolocalización
 */
export function useNearbyBusinesses(_limit = 10) {
	// Placeholder - por ahora retorna los mismos que "todos"
	return useQuery({
		queryKey: ["businesses", "nearby"],
		queryFn: () => fetchAllBusinesses({ limit: 10 }),
		staleTime: 1000 * 60 * 5,
	});
}

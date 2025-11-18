import { useQuery } from "@tanstack/react-query";
import type { Business } from "@/src/core/entities/Business";
import { SupabaseBusinessRepository } from "@/src/infrastructure/repositories/SupabaseBusinessRepository";

interface UseBusinessByIdOptions {
	enabled?: boolean;
}

/**
 * Hook para obtener un negocio por ID usando React Query
 * Sigue el patrón: UI → Hook → Repository
 */
export const useBusinessById = (
	businessId: string,
	options: UseBusinessByIdOptions = {},
) => {
	const businessRepo = new SupabaseBusinessRepository();

	return useQuery<Business | null>({
		queryKey: ["business", businessId],
		queryFn: () => businessRepo.getBusinessById(businessId),
		enabled: options.enabled !== false && !!businessId,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
};

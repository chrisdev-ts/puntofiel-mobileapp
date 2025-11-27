import { getPromotionById } from "@/src/infrastructure/repositories/promotionRepository";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook para obtener el detalle de una promoción por ID
 * @param id string | undefined
 */
export function usePromotionDetail(id?: string) {
	return useQuery({
		queryKey: ["promotion-detail", id],
		queryFn: async () => {
			if (!id) return undefined;
			return getPromotionById(id);
		},
		enabled: !!id,
	});
}

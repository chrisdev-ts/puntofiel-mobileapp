import { useQuery } from "@tanstack/react-query";
import type { Promotion } from "@/src/core/entities/Promotion";
import { supabase } from "@/src/infrastructure/services/supabase";

/**
 * Hook para obtener una promoción específica por ID
 */
export const usePromotion = (promotionId: string | null) => {
	return useQuery<Promotion, Error>({
		queryKey: ["promotion", promotionId],
		queryFn: async () => {
			if (!promotionId) {
				throw new Error("ID de promoción no disponible");
			}

			console.log("[usePromotion] 📋 Obteniendo promoción:", promotionId);

			const { data, error } = await supabase
				.from("promotions")
				.select("*")
				.eq("id", promotionId)
				.single();

			if (error) {
				console.error("[usePromotion] ❌ Error:", error);
				throw new Error(error.message);
			}

			if (!data) {
				throw new Error("Promoción no encontrada");
			}

			console.log("[usePromotion] ✅ Promoción obtenida:", data.title);

			// Convertir de snake_case a camelCase
			const promotion: Promotion = {
				id: data.id,
				businessId: data.business_id,
				title: data.title,
				content: data.content,
				startDate: data.start_date,
				endDate: data.end_date,
				imageUrl: data.image_url ? sanitizeUrl(data.image_url) : null,
				isActive: data.is_active,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
			};

			return promotion;
		},
		enabled: !!promotionId,
		staleTime: 2 * 60 * 1000, // 2 minutos
		retry: 2,
	});
};

/**
 * Función para sanitizar URLs
 */
function sanitizeUrl(url: string): string {
	if (!url) return "";

	let clean = url.trim();
	clean = decodeURIComponent(clean);
	clean = clean.replace(/\s+$/, "");

	try {
		const urlObj = new URL(clean);
		return urlObj.toString();
	} catch {
		return clean;
	}
}

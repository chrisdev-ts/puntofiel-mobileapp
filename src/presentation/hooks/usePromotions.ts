import type { Promotion } from "@/src/core/entities/Promotion";
import { supabase } from "@/src/infrastructure/services/supabase";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook para obtener todas las promociones de un negocio
 */
export const usePromotions = (businessId: string | null) => {
	return useQuery<Promotion[], Error>({
		queryKey: ["promotions", businessId],
		queryFn: async () => {
			if (!businessId) {
				throw new Error("ID de negocio no disponible");
			}

			console.log(
				"[usePromotions] 📋 Obteniendo promociones para negocio:",
				businessId,
			);

			const { data, error } = await supabase
				.from("promotions")
				.select("*")
				.eq("business_id", businessId)
				.order("created_at", { ascending: false });

			if (error) {
				console.error("[usePromotions] ❌ Error:", error);
				throw new Error(error.message);
			}

			console.log(
				"[usePromotions] ✅ Promociones obtenidas:",
				data?.length || 0,
			);

			// Convertir de snake_case a camelCase
			type SupabasePromotion = {
				id: string;
				business_id: string;
				title: string;
				content: string;
				start_date: string;
				end_date?: string;
				image_url?: string;
				is_active: boolean;
				created_at: string;
				updated_at: string;
			};

			const promotions: Promotion[] = (data || []).map(
				(promo: SupabasePromotion) => ({
					id: promo.id,
					businessId: promo.business_id,
					title: promo.title,
					content: promo.content,
					startDate: promo.start_date,
					endDate: promo.end_date,
					imageUrl: promo.image_url ? sanitizeUrl(promo.image_url) : null, // ✅ Limpiar URL
					isActive: promo.is_active,
					createdAt: promo.created_at,
					updatedAt: promo.updated_at,
				}),
			);

			return promotions;
		},
		enabled: !!businessId,
		staleTime: 30 * 1000, // 30 segundos - más corto para ver cambios rápidamente
		retry: 2,
	});
};

/**
 * ✅ Función para sanitizar URLs (eliminar espacios y caracteres inválidos)
 */
function sanitizeUrl(url: string): string {
	if (!url) return "";

	// 1. Remover espacios al inicio y final
	let clean = url.trim();

	// 2. Decodificar cualquier %20 existente y luego codificar correctamente
	// Esto asegura que los espacios se encoden como %20 sin duplicados
	clean = decodeURIComponent(clean);

	// 3. Remover espacios en blanco problemáticos al final
	clean = clean.replace(/\s+$/, "");

	// 4. Re-codificar la URL
	try {
		const urlObj = new URL(clean);
		return urlObj.toString();
	} catch {
		// Si no es una URL válida, retornar limpia
		return clean;
	}
}

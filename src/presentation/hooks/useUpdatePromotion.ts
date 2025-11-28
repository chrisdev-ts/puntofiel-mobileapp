import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/src/infrastructure/services/supabase";

export interface UpdatePromotionInput {
	id: string;
	data: {
		title?: string;
		content?: string;
		startDate?: Date | string;
		endDate?: Date | string | null;
		imageUrl?: string;
		isActive?: boolean;
	};
}

/**
 * Hook para actualizar una promoción
 */
export const useUpdatePromotion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: UpdatePromotionInput) => {
			console.log("[useUpdatePromotion] 📝 Actualizando promoción:", id);

			const startDate =
				data.startDate instanceof Date
					? data.startDate.toISOString()
					: data.startDate;

			const endDate = data.endDate
				? data.endDate instanceof Date
					? data.endDate.toISOString()
					: data.endDate
				: null;

			const updateData: Record<string, unknown> = {
				updated_at: new Date().toISOString(),
			};

			// Solo actualizar campos que se proporcionan
			if (data.title) {
				updateData.title = data.title;
			}
			if (data.content) {
				updateData.content = data.content;
			}
			if (data.startDate) {
				updateData.start_date = startDate;
			}
			if (data.endDate !== undefined) {
				updateData.end_date = endDate;
			}
			if (data.imageUrl) {
				updateData.image_url = data.imageUrl;
			}
			if (data.isActive !== undefined) {
				updateData.is_active = data.isActive;
			}

			const { data: updated, error } = await supabase
				.from("promotions")
				.update(updateData)
				.eq("id", id)
				.select()
				.single();

			if (error) {
				console.error("[useUpdatePromotion] ❌ Error:", error);
				throw new Error(error.message);
			}

			console.log(
				"[useUpdatePromotion] ✅ Promoción actualizada correctamente",
			);

			return updated;
		},
		onSuccess: (data) => {
			// Invalidar queries relacionadas
			queryClient.invalidateQueries({ queryKey: ["promotion", data.id] });
			queryClient.invalidateQueries({ queryKey: ["promotions"] });
		},
		onError: (error: unknown) => {
			console.error("[useUpdatePromotion] 🔴 Error en mutación:", error);
		},
	});
};

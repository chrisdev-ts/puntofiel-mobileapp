import { useMutation, useQueryClient } from "@tanstack/react-query";
import { imageUploadService } from "@/src/infrastructure/services/imageUploadService";
import { supabase } from "@/src/infrastructure/services/supabase";

interface DeletePromotionData {
	id: string;
	businessId: string;
	imageUrl?: string;
}

export const useDeletePromotion = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, imageUrl }: DeletePromotionData) => {
			// Eliminar imagen si existe
			if (imageUrl) {
				await imageUploadService.deleteImage(imageUrl);
			}

			// Eliminar promoción
			const { error } = await supabase.from("promotions").delete().eq("id", id);

			if (error) throw error;
			return id;
		},
		onSuccess: (_, { businessId }) => {
			queryClient.invalidateQueries({ queryKey: ["promotions", businessId] });
		},
	});
};

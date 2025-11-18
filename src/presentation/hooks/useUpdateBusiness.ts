import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BusinessCategory } from "@/src/core/entities/Business";
import { SupabaseBusinessRepository } from "@/src/infrastructure/repositories/SupabaseBusinessRepository";

interface UpdateBusinessParams {
	businessId: string;
	businessData: {
		name: string;
		category: BusinessCategory;
		locationAddress?: string;
		openingHours?: string;
	};
	logoUri?: string;
}

/**
 * Hook para actualizar un negocio
 * Maneja la subida de logo y actualización de datos automáticamente
 */
export const useUpdateBusiness = () => {
	const queryClient = useQueryClient();
	const businessRepo = new SupabaseBusinessRepository();

	const mutation = useMutation({
		mutationFn: async ({
			businessId,
			businessData,
			logoUri,
		}: UpdateBusinessParams) => {
			// 1. Subir logo si es necesario (solo si es un archivo local)
			let logoUrl: string | undefined;
			if (logoUri && !logoUri.startsWith("http")) {
				logoUrl = await businessRepo.uploadBusinessLogo(logoUri, businessId);
			}

			// 2. Actualizar negocio con los nuevos datos
			await businessRepo.updateBusiness(businessId, {
				...businessData,
				...(logoUrl && { logoUrl }),
			});

			return businessId;
		},
		onSuccess: (businessId) => {
			// Invalidar queries relacionadas
			queryClient.invalidateQueries({ queryKey: ["businesses"] });
			queryClient.invalidateQueries({ queryKey: ["business", businessId] });
		},
	});

	return {
		updateBusinessAsync: mutation.mutateAsync,
		updateBusiness: mutation.mutate,
		isUpdating: mutation.isPending,
		error: mutation.error,
	};
};

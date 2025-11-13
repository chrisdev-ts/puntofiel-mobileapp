import type { CreateBusinessDTO } from "@/src/core/entities/Business";
import { CreateBusinessUseCase } from "@/src/core/usecases/business/CreateBusinessUseCase";
import { SupabaseBusinessRepository } from "@/src/infrastructure/repositories/SupabaseBusinessRepository";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Instanciar dependencias siguiendo Inversión de Dependencia
const businessRepository = new SupabaseBusinessRepository();
const createBusinessUseCase = new CreateBusinessUseCase(businessRepository);

/**
 * Hook personalizado para crear negocios en PuntoFiel.
 * 
 * Conecta la capa de presentación con el caso de uso del core,
 * manteniendo la separación de responsabilidades.
 */
export const useCreateBusiness = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({
            businessData,
            logoUri,
        }: {
            businessData: CreateBusinessDTO;
            logoUri?: string;
        }) => {
            console.log("[useCreateBusiness] Ejecutando creación de negocio...");
            console.log("[useCreateBusiness] Datos:", {
                name: businessData.name,
                category: businessData.category,
                hasLogo: !!logoUri,
            });

            try {
                const result = await createBusinessUseCase.execute(businessData, logoUri);
                console.log("[useCreateBusiness] Negocio creado:", result.id);
                return result;
            } catch (error) {
                console.error("[useCreateBusiness] Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidar cache de negocios para refrescar la lista
            queryClient.invalidateQueries({ queryKey: ["businesses"] });
        },
    });

    return {
        createBusiness: mutation.mutate,
        createBusinessAsync: mutation.mutateAsync,
        isCreating: mutation.isPending,
        error: mutation.error,
        business: mutation.data,
        reset: mutation.reset,
    };
};
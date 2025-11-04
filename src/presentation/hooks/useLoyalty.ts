import { useQuery } from "@tanstack/react-query";
import { GetLoyaltyCardsUseCase } from "@/src/core/usecases/loyalty/getLoyaltyCardsUseCase";
import { SupabaseLoyaltyRepository } from "@/src/infrastructure/repositories/SupabaseLoyaltyRepository";
import { useAuthStore } from "@/src/presentation/stores/authStore";

// 1. Instanciamos dependencias (Patrón de ARCHITECTURE.md)
const loyaltyRepository = new SupabaseLoyaltyRepository();
const getLoyaltyCardsUseCase = new GetLoyaltyCardsUseCase(loyaltyRepository);

export const useLoyalty = () => {
	// 2. Obtenemos el ID del usuario del store de autenticación
	const user = useAuthStore((state) => state.user);
	const customerId = user?.id ?? null;

	console.log("[useLoyalty] Usuario del store:", user);
	console.log("[useLoyalty] Customer ID:", customerId);

	// 3. Definimos el useQuery
	const { data, isLoading, error, refetch } = useQuery({
		// La Query Key identifica esta 'fetch'
		queryKey: ["loyaltyCards", customerId],

		queryFn: async () => {
			console.log(
				"[useLoyalty] Ejecutando queryFn para customerId:",
				customerId,
			);
			if (!customerId) {
				console.log("[useLoyalty] No hay customerId, retornando array vacío");
				return Promise.resolve([]);
			}
			const result = await getLoyaltyCardsUseCase.execute(customerId);
			console.log("[useLoyalty] Resultado de getLoyaltyCardsUseCase:", result);
			return result;
		},

		// Solo habilita la query si el customerId existe
		enabled: !!customerId,

		// Forzar que se ejecute siempre (para debugging)
		staleTime: 0,
		gcTime: 0,
	});

	console.log("[useLoyalty] Query state:", { data, isLoading, error });

	return {
		cards: data ?? [], // Devuelve array vacío por defecto
		isLoading,
		error,
		refetch,
	};
};

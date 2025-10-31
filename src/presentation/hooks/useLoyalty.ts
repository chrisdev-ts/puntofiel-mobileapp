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

	// 3. Definimos el useQuery
	const { data, isLoading, error, refetch } = useQuery({
		// La Query Key identifica esta 'fetch'
		queryKey: ["loyaltyCards", customerId],

		queryFn: () => {
			if (!customerId) return Promise.resolve([]); // No hacer fetch si no hay user
			return getLoyaltyCardsUseCase.execute(customerId);
		},

		// Solo habilita la query si el customerId existe
		enabled: !!customerId,
	});

	return {
		cards: data ?? [], // Devuelve array vacío por defecto
		isLoading,
		error,
		refetch,
	};
};

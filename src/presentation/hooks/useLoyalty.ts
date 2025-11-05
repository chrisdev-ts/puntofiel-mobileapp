import { useQuery } from "@tanstack/react-query";
import { GetLoyaltyCardsUseCase } from "@/src/core/usecases/loyalty/getLoyaltyCardsUseCase";
import { SupabaseLoyaltyRepository } from "@/src/infrastructure/repositories/SupabaseLoyaltyRepository";
import { useAuthStore } from "@/src/presentation/stores/authStore";

// 1. Instanciamos dependencias (Patrón de ARCHITECTURE.md)
const loyaltyRepository = new SupabaseLoyaltyRepository();
const getLoyaltyCardsUseCase = new GetLoyaltyCardsUseCase(loyaltyRepository);

export function useLoyalty() {
	const user = useAuthStore((state) => state.user);
	const customerId = user?.id;

	return useQuery({
		queryKey: ["loyaltyCards", customerId],
		queryFn: async () => {
			if (!customerId) {
				throw new Error("No hay usuario autenticado");
			}

			const result = await getLoyaltyCardsUseCase.execute(customerId);
			return result;
		},
		enabled: !!customerId,
		staleTime: 1000 * 60 * 5,
	});
}

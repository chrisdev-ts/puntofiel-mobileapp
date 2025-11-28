import { useQuery } from "@tanstack/react-query";
import { GetRafflesUseCase } from "@/src/core/usecases/raffle/GetRafflesUseCase";
import { SupabaseRaffleRepository } from "@/src/infrastructure/repositories/SupabaseRaffleRepository";

const raffleRepository = new SupabaseRaffleRepository();
const getRafflesUseCase = new GetRafflesUseCase(raffleRepository);

export function useBusinessRaffles(businessId: string) {
	const query = useQuery({
		queryKey: ["business_raffles", businessId],
		queryFn: () => getRafflesUseCase.execute(businessId),
		enabled: !!businessId,
		staleTime: 1000 * 60 * 2, // 2 minutos
	});

	return {
		raffles: query.data || [],
		isLoading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

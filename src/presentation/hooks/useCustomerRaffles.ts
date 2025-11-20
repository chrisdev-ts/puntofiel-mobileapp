import { GetCustomerRafflesUseCase } from "@/src/core/usecases/raffle/GetCustomerRafflesUseCase";
import { SupabaseRaffleRepository } from "@/src/infrastructure/repositories/SupabaseRaffleRepository";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

const raffleRepository = new SupabaseRaffleRepository();
const getCustomerRafflesUseCase = new GetCustomerRafflesUseCase(raffleRepository);

export function useCustomerRaffles() {
    const { user } = useAuth();
    const customerId = user?.id;

    const query = useQuery({
        queryKey: ["customer_raffles", customerId],
        queryFn: () => getCustomerRafflesUseCase.execute(customerId as string),
        enabled: !!customerId && user?.role === 'customer',
        staleTime: 1000 * 60 * 2, // 2 minutos
    });

    return {
        raffles: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch
    };
}
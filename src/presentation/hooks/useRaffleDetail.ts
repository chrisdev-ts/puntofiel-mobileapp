import { GetRaffleByIdUseCase } from "@/src/core/usecases/raffle/GetRaffleByIdUseCase";
import { SupabaseRaffleRepository } from "@/src/infrastructure/repositories/SupabaseRaffleRepository";
import { useQuery } from "@tanstack/react-query";

// Instancias (Dependency Injection)
const raffleRepository = new SupabaseRaffleRepository();
const getRaffleByIdUseCase = new GetRaffleByIdUseCase(raffleRepository);

export function useRaffleDetail(raffleId: string | undefined) {
    return useQuery({
        queryKey: ["raffle", raffleId],
        queryFn: () => getRaffleByIdUseCase.execute(raffleId as string),
        enabled: !!raffleId, // Solo ejecuta si hay ID
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
    });
}
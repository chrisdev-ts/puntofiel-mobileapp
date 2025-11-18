import { SupabaseRaffleRepository } from "@/src/infrastructure/repositories/SupabaseRaffleRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Instancia del repositorio
const raffleRepository = new SupabaseRaffleRepository();

// 1. Hook para obtener los participantes
export function useRaffleParticipants(raffleId: string | undefined) {
    return useQuery({
        queryKey: ["raffle_participants", raffleId],
        queryFn: async () => {
            if (!raffleId) return [];
            return raffleRepository.getParticipants(raffleId);
        },
        enabled: !!raffleId,
    });
}

// 2. Hook para guardar al ganador
export function useSelectWinner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ raffleId, customerId }: { raffleId: string; customerId: string }) => {
            return raffleRepository.selectWinner(raffleId, customerId);
        },
        onSuccess: (_, variables) => {
            // Actualizamos el detalle de la rifa y la lista principal
            queryClient.invalidateQueries({ queryKey: ["raffle", variables.raffleId] });
            queryClient.invalidateQueries({ queryKey: ["raffles"] });
        },
    });
}
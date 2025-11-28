import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BuyTicketUseCase } from "@/src/core/usecases/raffle/BuyTicketUseCase";
import { GetUserTicketCountUseCase } from "@/src/core/usecases/raffle/GetUserTicketCountUseCase";
import { ReturnTicketsUseCase } from "@/src/core/usecases/raffle/ReturnTicketsUseCase";
import { SupabaseRaffleRepository } from "@/src/infrastructure/repositories/SupabaseRaffleRepository";
import { useAuth } from "./useAuth";

// --- INYECCIÓN DE DEPENDENCIAS ---
const raffleRepository = new SupabaseRaffleRepository();
const buyTicketUseCase = new BuyTicketUseCase(raffleRepository);
const returnTicketsUseCase = new ReturnTicketsUseCase(raffleRepository);
const getUserTicketCountUseCase = new GetUserTicketCountUseCase(
	raffleRepository,
);

export function useUserTickets(raffleId: string | undefined) {
	const { user } = useAuth();
	return useQuery({
		queryKey: ["user_tickets", raffleId, user?.id],
		queryFn: () =>
			raffleId && user?.id
				? getUserTicketCountUseCase.execute(raffleId, user.id)
				: undefined,
		enabled: !!raffleId && !!user,
	});
}

export function useRaffleActions() {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const buyMutation = useMutation({
		mutationFn: async ({
			raffleId,
			cost,
		}: {
			raffleId: string;
			cost: number;
		}) => {
			if (!user) throw new Error("No user");
			return buyTicketUseCase.execute(raffleId, user.id, cost);
		},
		onSuccess: (_, vars) => {
			// Invalidar para refrescar UI: Boletos comprados y Puntos restantes
			queryClient.invalidateQueries({
				queryKey: ["user_tickets", vars.raffleId],
			});
			queryClient.invalidateQueries({ queryKey: ["business_detail"] });
			// Asegurar que la lista de rifas del cliente se actualice inmediatamente
			queryClient.invalidateQueries({
				queryKey: ["customer_raffles", user?.id],
			});
			// También invalidar el detalle de la rifa si está abierto
			queryClient.invalidateQueries({ queryKey: ["raffle", vars.raffleId] });
		},
	});

	const returnMutation = useMutation({
		mutationFn: async (raffleId: string) => {
			if (!user) throw new Error("No user");
			return returnTicketsUseCase.execute(raffleId, user.id);
		},
		onSuccess: (_, raffleId) => {
			// 1. Invalidar tickets (para que el conteo en detalle cambie de 1+ a 0)
			queryClient.invalidateQueries({ queryKey: ["user_tickets", raffleId] });

			// 2. Invalidar detalle del negocio (para refrescar puntos)
			queryClient.invalidateQueries({ queryKey: ["business_detail"] });

			// 🔥 3. AÑADIR ESTA LÍNEA CLAVE: Invalidar la lista de rifas del cliente
			//    Esto obliga a useCustomerRaffles a recalcular 'isParticipating'
			queryClient.invalidateQueries({
				queryKey: ["customer_raffles", user?.id],
			});

			// Opcional, pero recomendable: Invalidar el detalle de la rifa si está en pantalla
			queryClient.invalidateQueries({ queryKey: ["raffle", raffleId] });
		},
	});

	return {
		buyTicket: buyMutation.mutateAsync,
		returnTickets: returnMutation.mutateAsync,
		isBuying: buyMutation.isPending,
		isReturning: returnMutation.isPending,
	};
}

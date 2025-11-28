import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
	CreateRewardDTO,
	UpdateRewardDTO,
} from "@/src/core/entities/Reward";
import { CreateRewardUseCase } from "@/src/core/usecases/reward/CreateRewardUseCase";
import { DeleteRewardUseCase } from "@/src/core/usecases/reward/DeleteRewardUseCase";
import { GetRewardsUseCase } from "@/src/core/usecases/reward/GetRewardsUseCase";
import { RedeemRewardUseCase } from "@/src/core/usecases/reward/RedeemRewardUseCase"; // Nuevo import
import { UpdateRewardUseCase } from "@/src/core/usecases/reward/UpdateRewardUseCase";
import { SupabaseRewardRepository } from "@/src/infrastructure/repositories/SupabaseRewardRepository";

// Instancias de casos de uso (Dependency Injection)
const rewardRepository = new SupabaseRewardRepository();
const getRewardsUseCase = new GetRewardsUseCase(rewardRepository);
const _createRewardUseCase = new CreateRewardUseCase(rewardRepository); // Nota: Se usan dentro de las mutaciones aunque no se exporten directo
const _updateRewardUseCase = new UpdateRewardUseCase(rewardRepository);
const deleteRewardUseCase = new DeleteRewardUseCase(rewardRepository);
const redeemRewardUseCase = new RedeemRewardUseCase(rewardRepository); // Nueva instancia

export function useReward(businessId: string | undefined) {
	const queryClient = useQueryClient();

	// Query: Listar recompensas
	const {
		data: rewards,
		isLoading: isLoadingRewards,
		error: rewardsError,
		refetch: refetchRewards,
	} = useQuery({
		queryKey: ["rewards", businessId],
		queryFn: () => getRewardsUseCase.execute(businessId as string),
		enabled: !!businessId,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});

	// Mutation: Crear recompensa
	const createRewardMutation = useMutation({
		mutationFn: async ({
			dto,
			imageUri,
		}: {
			dto: CreateRewardDTO;
			imageUri?: string;
		}) => {
			return rewardRepository.createReward(dto, imageUri);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rewards", businessId] });
		},
	});

	// Mutation: Actualizar recompensa
	const updateRewardMutation = useMutation({
		mutationFn: async ({
			rewardId,
			dto,
			imageUri,
		}: {
			rewardId: string;
			dto: UpdateRewardDTO;
			imageUri?: string;
		}) => {
			return rewardRepository.updateReward(rewardId, dto, imageUri);
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["rewards", businessId] });
			queryClient.invalidateQueries({ queryKey: ["reward", data.id] });
		},
	});

	// Mutation: Eliminar recompensa
	const deleteRewardMutation = useMutation({
		mutationFn: async (rewardId: string) => {
			if (!businessId) throw new Error("businessId es requerido");
			return deleteRewardUseCase.execute(rewardId, businessId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["rewards", businessId] });
		},
	});

	// Mutation: Canjear recompensa (Redeem)
	const redeemRewardMutation = useMutation({
		mutationFn: async ({
			rewardId,
			userId,
			cost,
		}: {
			rewardId: string;
			userId: string;
			cost: number;
		}) => {
			return redeemRewardUseCase.execute(rewardId, userId, cost);
		},
		onSuccess: () => {
			// 1. Invalidar detalle del negocio para actualizar puntos del usuario en la UI
			queryClient.invalidateQueries({ queryKey: ["business_detail"] });

			// 2. Opcional: Recargar lista de recompensas por si alguna lógica de stock cambia
			queryClient.invalidateQueries({ queryKey: ["rewards", businessId] });
		},
	});

	return {
		// Query
		rewards: rewards || [],
		isLoadingRewards,
		rewardsError,
		refetchRewards,

		// Crear
		createReward: createRewardMutation.mutateAsync,
		isCreating: createRewardMutation.isPending,
		createError: createRewardMutation.error,
		createSuccess: createRewardMutation.isSuccess,
		resetCreate: createRewardMutation.reset,

		// Actualizar
		updateReward: updateRewardMutation.mutateAsync,
		isUpdating: updateRewardMutation.isPending,
		updateError: updateRewardMutation.error,
		updateSuccess: updateRewardMutation.isSuccess,
		resetUpdate: updateRewardMutation.reset,

		// Eliminar
		deleteReward: deleteRewardMutation.mutate,
		isDeleting: deleteRewardMutation.isPending,
		deleteError: deleteRewardMutation.error,
		deleteSuccess: deleteRewardMutation.isSuccess,
		resetDelete: deleteRewardMutation.reset,

		// Canjear (NUEVO)
		redeemReward: redeemRewardMutation.mutateAsync,
		isRedeeming: redeemRewardMutation.isPending,
		redeemError: redeemRewardMutation.error,
		redeemSuccess: redeemRewardMutation.isSuccess,
		resetRedeem: redeemRewardMutation.reset,
	};
}

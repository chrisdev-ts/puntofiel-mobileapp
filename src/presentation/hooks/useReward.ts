import type { CreateRewardDTO, UpdateRewardDTO } from '@/src/core/entities/Reward';
import { CreateRewardUseCase } from '@/src/core/usecases/reward/CreateRewardUseCase';
import { DeleteRewardUseCase } from '@/src/core/usecases/reward/DeleteRewardUseCase';
import { GetRewardsUseCase } from '@/src/core/usecases/reward/GetRewardsUseCase';
import { UpdateRewardUseCase } from '@/src/core/usecases/reward/UpdateRewardUseCase';
import { SupabaseRewardRepository } from '@/src/infrastructure/repositories/SupabaseRewardRepository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Instancias de casos de uso (Dependency Injection)
const rewardRepository = new SupabaseRewardRepository();
const getRewardsUseCase = new GetRewardsUseCase(rewardRepository);
const createRewardUseCase = new CreateRewardUseCase(rewardRepository);
const updateRewardUseCase = new UpdateRewardUseCase(rewardRepository);
const deleteRewardUseCase = new DeleteRewardUseCase(rewardRepository);

export function useReward(businessId: string | undefined) {
  const queryClient = useQueryClient();

  // Query: Listar recompensas
  const {
    data: rewards,
    isLoading: isLoadingRewards,
    error: rewardsError,
    refetch: refetchRewards,
  } = useQuery({
    queryKey: ['rewards', businessId],
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
      queryClient.invalidateQueries({ queryKey: ['rewards', businessId] });
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
      queryClient.invalidateQueries({ queryKey: ['rewards', businessId] });
      queryClient.invalidateQueries({ queryKey: ['reward', data.id] });
    },
  });

  // Mutation: Eliminar recompensa
  const deleteRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!businessId) throw new Error('businessId es requerido');
      return deleteRewardUseCase.execute(rewardId, businessId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards', businessId] });
    },
  });

  return {
    // Query
    rewards: rewards || [],
    isLoadingRewards,
    rewardsError,
    refetchRewards,

    // Crear
    createReward: createRewardMutation.mutate,
    isCreating: createRewardMutation.isPending,
    createError: createRewardMutation.error,
    createSuccess: createRewardMutation.isSuccess,
    resetCreate: createRewardMutation.reset,

    // Actualizar
    updateReward: updateRewardMutation.mutate,
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
  };
}
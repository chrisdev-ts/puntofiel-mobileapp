import { useQuery } from "@tanstack/react-query";
import { GetRewardByIdUseCase } from "@/src/core/usecases/reward/GetRewardByIdUseCase";
import { SupabaseRewardRepository } from "@/src/infrastructure/repositories/SupabaseRewardRepository";

const rewardRepository = new SupabaseRewardRepository();
const getRewardByIdUseCase = new GetRewardByIdUseCase(rewardRepository);

export function useRewardDetail(rewardId: string | undefined) {
	return useQuery({
		queryKey: ["reward", rewardId],
		queryFn: () => getRewardByIdUseCase.execute(rewardId as string),
		enabled: !!rewardId,
		staleTime: 1000 * 60 * 5,
	});
}

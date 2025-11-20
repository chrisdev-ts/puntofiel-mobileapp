import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";

export class RedeemRewardUseCase {
    constructor(private readonly rewardRepository: IRewardRepository) {}

    async execute(rewardId: string, userId: string, pointsCost: number): Promise<void> {
        if (!rewardId) throw new Error("ID de recompensa requerido");
        if (!userId) throw new Error("ID de usuario requerido");
        if (pointsCost <= 0) throw new Error("El costo debe ser mayor a 0");

        return await this.rewardRepository.redeemReward(rewardId, userId, pointsCost);
    }
}
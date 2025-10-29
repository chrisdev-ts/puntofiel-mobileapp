import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";

/**
 * Caso de uso para desactivar (soft delete) una recompensa.
 * Valida que la recompensa pertenece al negocio antes de desactivarla.
 */
export class DeleteRewardUseCase {
	constructor(private readonly rewardRepository: IRewardRepository) {}

	async execute(rewardId: string, businessId: string): Promise<void> {
		// Validaciones de negocio
		if (!rewardId || rewardId.trim() === "") {
			throw new Error("El ID de la recompensa es requerido");
		}

		if (!businessId || businessId.trim() === "") {
			throw new Error("El ID del negocio es requerido");
		}

		// Delegar al repositorio
		await this.rewardRepository.deleteReward(rewardId, businessId);
	}
}

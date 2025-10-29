import type { Reward } from "@/src/core/entities/Reward";
import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";

/**
 * Caso de uso para obtener todas las recompensas activas de un negocio.
 *
 * Validaciones de negocio:
 * - El businessId debe ser válido
 * - Solo retorna recompensas activas (is_active = true)
 */
export class GetRewardsUseCase {
	constructor(private readonly rewardRepository: IRewardRepository) {}

	async execute(businessId: string): Promise<Reward[]> {
		// Validación: el businessId no puede estar vacío
		if (!businessId || businessId.trim() === "") {
			throw new Error("El ID del negocio es requerido");
		}

		// Delegar al repositorio
		return await this.rewardRepository.getRewardsByBusiness(businessId);
	}
}

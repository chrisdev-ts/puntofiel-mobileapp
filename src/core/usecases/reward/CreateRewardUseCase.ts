import type { CreateRewardDTO, Reward } from "@/src/core/entities/Reward";
import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";

/**
 * Caso de uso para crear una nueva recompensa.
 *
 * Validaciones de negocio:
 * - El nombre debe tener al menos 3 caracteres
 * - Los puntos requeridos deben ser mayores a 0
 * - El businessId debe ser válido
 */
export class CreateRewardUseCase {
	constructor(private readonly rewardRepository: IRewardRepository) {}

	async execute(dto: CreateRewardDTO, imageUri?: string): Promise<Reward> {
		// Validación: el nombre no puede estar vacío
		if (!dto.name || dto.name.trim().length < 3) {
			throw new Error("El nombre debe tener al menos 3 caracteres");
		}

		// Validación: los puntos deben ser positivos
		if (!dto.pointsRequired || dto.pointsRequired <= 0) {
			throw new Error("Los puntos requeridos deben ser mayores a 0");
		}

		// Validación: el businessId debe existir
		if (!dto.businessId || dto.businessId.trim() === "") {
			throw new Error("El ID del negocio es requerido");
		}

		// Delegar al repositorio (que maneja la subida de imagen si existe)
		return await this.rewardRepository.createReward(dto, imageUri);
	}
}

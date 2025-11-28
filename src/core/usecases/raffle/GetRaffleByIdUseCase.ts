import type { Raffle } from "@/src/core/entities/AnnualRaffle";
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

/**
 * Caso de uso para obtener una rifa específica por su ID.
 *
 * Validaciones de negocio:
 * - El ID de la rifa debe ser válido
 * - Si la rifa no existe, retorna null
 */
export class GetRaffleByIdUseCase {
	constructor(private readonly raffleRepository: IRaffleRepository) {}

	async execute(raffleId: string): Promise<Raffle | null> {
		// Validación: el ID no puede estar vacío
		if (!raffleId || raffleId.trim() === "") {
			throw new Error("El ID de la rifa es requerido");
		}

		// Delegar al repositorio
		return await this.raffleRepository.getRaffleById(raffleId);
	}
}

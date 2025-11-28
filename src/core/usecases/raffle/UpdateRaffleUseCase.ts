import type { Raffle, UpdateRaffleDTO } from "@/src/core/entities/AnnualRaffle";
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

/**
 * Caso de uso para actualizar una rifa existente.
 *
 * Validaciones de negocio:
 * - El raffleId debe ser válido
 * - Validaciones parciales de datos (si existen en el DTO)
 */
export class UpdateRaffleUseCase {
	constructor(private readonly raffleRepository: IRaffleRepository) {}

	async execute(
		raffleId: string,
		dto: UpdateRaffleDTO,
		imageUri?: string,
	): Promise<Raffle> {
		// Validación: el raffleId no puede estar vacío
		if (!raffleId || raffleId.trim() === "") {
			throw new Error("El ID de la rifa es requerido");
		}

		// Validación: Nombre
		if (dto.name !== undefined && dto.name.trim().length < 3) {
			throw new Error("El nombre debe tener al menos 3 caracteres");
		}

		// Validación: Puntos
		if (dto.pointsRequired !== undefined && dto.pointsRequired <= 0) {
			throw new Error("Los puntos requeridos deben ser mayores a 0");
		}

		// Validación: Fechas (Solo si ambas vienen en el update para comparar)
		if (dto.startDate && dto.endDate && dto.endDate <= dto.startDate) {
			throw new Error(
				"La fecha de finalización debe ser posterior a la de inicio",
			);
		}

		// Delegar al repositorio
		return await this.raffleRepository.updateRaffle(raffleId, dto, imageUri);
	}
}

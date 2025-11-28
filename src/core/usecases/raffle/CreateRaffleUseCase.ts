import type { CreateRaffleDTO } from "@/src/core/entities/AnnualRaffle";
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

/**
 * Caso de uso para crear una nueva rifa anual.
 *
 * Validaciones de negocio:
 * - El nombre debe tener al menos 3 caracteres
 * - Los puntos requeridos deben ser mayores a 0
 * - El máximo de boletos debe ser mayor a 0
 * - La fecha de fin debe ser posterior a la de inicio
 * - El businessId debe ser válido
 */
export class CreateRaffleUseCase {
	constructor(private readonly raffleRepository: IRaffleRepository) {}

	async execute(dto: CreateRaffleDTO, imageUri?: string): Promise<void> {
		// Validación: el nombre no puede estar vacío
		if (!dto.name || dto.name.trim().length < 3) {
			throw new Error("El nombre debe tener al menos 3 caracteres");
		}

		// Validación: los puntos deben ser positivos
		if (!dto.pointsRequired || dto.pointsRequired <= 0) {
			throw new Error("Los puntos requeridos deben ser mayores a 0");
		}

		// Validación: máximo de boletos
		if (!dto.maxTicketsPerUser || dto.maxTicketsPerUser <= 0) {
			throw new Error("El límite de boletos debe ser mayor a 0");
		}

		// Validación: Fechas lógicas
		if (dto.endDate <= dto.startDate) {
			throw new Error(
				"La fecha de finalización debe ser posterior a la de inicio",
			);
		}

		// Validación: el businessId debe existir
		if (!dto.businessId || dto.businessId.trim() === "") {
			throw new Error("El ID del negocio es requerido");
		}

		// Delegar al repositorio
		return await this.raffleRepository.createRaffle(dto, imageUri);
	}
}

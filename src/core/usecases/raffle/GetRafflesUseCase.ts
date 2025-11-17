import type { Raffle } from "@/src/core/entities/AnnualRaffle";
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

/**
 * Caso de uso para obtener todas las rifas de un negocio.
 *
 * Validaciones de negocio:
 * - El businessId debe ser válido
 */
export class GetRafflesUseCase {
    constructor(private readonly raffleRepository: IRaffleRepository) {}

    async execute(businessId: string): Promise<Raffle[]> {
        // Validación: el businessId no puede estar vacío
        if (!businessId || businessId.trim() === "") {
            throw new Error("El ID del negocio es requerido");
        }

        // Delegar al repositorio
        return await this.raffleRepository.getRafflesByBusiness(businessId);
    }
}
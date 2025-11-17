import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

/**
 * Caso de uso para eliminar una rifa.
 * Valida que la rifa pertenece al negocio antes de eliminarla.
 */
export class DeleteRaffleUseCase {
    constructor(private readonly raffleRepository: IRaffleRepository) {}

    async execute(raffleId: string, businessId: string): Promise<void> {
        // Validaciones de negocio
        if (!raffleId || raffleId.trim() === "") {
            throw new Error("El ID de la rifa es requerido");
        }

        if (!businessId || businessId.trim() === "") {
            throw new Error("El ID del negocio es requerido");
        }

        // Delegar al repositorio
        await this.raffleRepository.deleteRaffle(raffleId, businessId);
    }
}
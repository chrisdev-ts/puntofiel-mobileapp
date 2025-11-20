import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

export class BuyTicketUseCase {
    constructor(private readonly raffleRepository: IRaffleRepository) {}

    async execute(raffleId: string, userId: string, cost: number): Promise<void> {
        if (!raffleId) throw new Error("ID de rifa requerido");
        if (!userId) throw new Error("ID de usuario requerido");
        if (cost < 0) throw new Error("El costo no puede ser negativo");

        return await this.raffleRepository.buyTicket(raffleId, userId, cost);
    }
}
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

export class ReturnTicketsUseCase {
	constructor(private readonly raffleRepository: IRaffleRepository) {}

	async execute(raffleId: string, userId: string): Promise<void> {
		if (!raffleId) throw new Error("ID de rifa requerido");
		if (!userId) throw new Error("ID de usuario requerido");

		return await this.raffleRepository.returnTickets(raffleId, userId);
	}
}

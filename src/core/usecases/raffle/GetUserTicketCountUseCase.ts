import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

export class GetUserTicketCountUseCase {
    constructor(private readonly raffleRepository: IRaffleRepository) {}

    async execute(raffleId: string, userId: string): Promise<number> {
        if (!raffleId || !userId) return 0;
        return await this.raffleRepository.getUserTicketCount(raffleId, userId);
    }
}
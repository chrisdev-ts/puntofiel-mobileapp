import type { Raffle } from "@/src/core/entities/AnnualRaffle";
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";

export class GetCustomerRafflesUseCase {
    constructor(private readonly raffleRepository: IRaffleRepository) {}

    async execute(customerId: string): Promise<Raffle[]> {
        if (!customerId) throw new Error("Customer ID es requerido");
        return await this.raffleRepository.getRafflesForCustomer(customerId);
    }
}
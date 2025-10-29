import type { ILoyaltyRepository } from "@/src/core/repositories/ILoyaltyRepository";

export class GetLoyaltyCardsUseCase {
	constructor(private loyaltyRepository: ILoyaltyRepository) {}

	async execute(customerId: string) {
		if (!customerId) {
			throw new Error("Customer ID es requerido");
		}
		// El repositorio se encargará de la lógica de 'JOINs'
		return this.loyaltyRepository.getCardsByCustomer(customerId);
	}
}

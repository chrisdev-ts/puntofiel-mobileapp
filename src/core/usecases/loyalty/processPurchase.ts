import type {
	ILoyaltyRepository,
	ProcessPurchaseResult,
} from "../../repositories/ILoyaltyRepository";

export class ProcessPurchaseUseCase {
	constructor(private readonly loyaltyRepository: ILoyaltyRepository) {}

	async execute(
		customerId: string,
		businessId: string,
		purchaseAmount: number,
	): Promise<ProcessPurchaseResult> {
		if (purchaseAmount <= 0) {
			return {
				success: false,
				message: "El monto de la compra debe ser mayor a cero.",
			};
		}
		return this.loyaltyRepository.processPurchase(
			customerId,
			businessId,
			purchaseAmount,
		);
	}
}

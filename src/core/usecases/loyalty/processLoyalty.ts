import type {
	ILoyaltyRepository,
	ProcessLoyaltyResult,
} from "../../repositories/ILoyaltyRepository";

export class ProcessLoyaltyUseCase {
	constructor(private readonly loyaltyRepository: ILoyaltyRepository) {}

	async execute(
		customerId: string,
		businessId: string,
		amount: number,
	): Promise<ProcessLoyaltyResult> {
		if (amount <= 0) {
			return {
				success: false,
				message: "El monto debe ser mayor a cero.",
			};
		}
		return this.loyaltyRepository.processLoyalty(
			customerId,
			businessId,
			amount,
		);
	}
}

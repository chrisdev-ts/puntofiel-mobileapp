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
		notes?: string,
	): Promise<ProcessLoyaltyResult> {
		// Validación de negocio
		if (amount <= 0) {
			console.error("ProcessLoyaltyUseCase: Invalid amount", { amount });
			return {
				success: false,
				message: "El monto debe ser mayor a cero.",
			};
		}

		const result = await this.loyaltyRepository.processLoyalty(
			customerId,
			businessId,
			amount,
			notes,
		);

		return result;
	}
}

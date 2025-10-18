export interface ProcessLoyaltyResult {
	success: boolean;
	message: string;
	newPointsBalance?: number;
}

export interface ILoyaltyRepository {
	processLoyalty(
		customerId: string,
		businessId: string,
		amount: number,
	): Promise<ProcessLoyaltyResult>;
}

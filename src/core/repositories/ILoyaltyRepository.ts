export interface ProcessPurchaseResult {
	success: boolean;
	message: string;
	newPointsBalance?: number;
}

export interface ILoyaltyRepository {
	processPurchase(
		customerId: string,
		businessId: string,
		purchaseAmount: number,
	): Promise<ProcessPurchaseResult>;
}

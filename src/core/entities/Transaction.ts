export interface Transaction {
	id: string;
	createdAt: Date;
	cardId: number;
	transactionType: "purchase_earn" | "redeem";
	purchaseAmount: number;
	pointsChange: number;
}

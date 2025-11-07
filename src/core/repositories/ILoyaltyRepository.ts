import type { CustomerLoyaltyCard } from "../entities/Loyalty";

export interface ProcessLoyaltyResult {
	success: boolean;
	message: string;
	newPointsBalance?: number;
}

export interface ILoyaltyRepository {
	/**
	 * Procesa la acumulación de puntos de lealtad
	 * basada en una compra realizada por el cliente.
	 */
	processLoyalty(
		customerId: string,
		businessId: string,
		amount: number,
		notes?: string,
	): Promise<ProcessLoyaltyResult>;

	/**
	 * Obtiene el resumen de tarjetas de lealtad de un cliente,
	 * incluyendo info del negocio y la próxima recompensa.
	 */
	getCardsByCustomer(customerId: string): Promise<CustomerLoyaltyCard[]>;
}

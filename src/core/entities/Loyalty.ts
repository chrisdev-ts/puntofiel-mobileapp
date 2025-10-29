/**
 * Representa la tarjeta de lealtad de un cliente,
 * enriquecida con datos del negocio y la próxima
 * recompensa para la UI.
 */
export interface CustomerLoyaltyCard {
	cardId: number; // Es 'BIGINT' en la BBDD
	points: number; // Es 'NUMERIC'
	businessId: string; // UUID
	businessName: string;
	businessLogoUrl: string | null;

	// Datos para la barra de progreso (derivado del mockup)
	nextRewardPoints: number | null; // Puntos de la próxima recompensa (ej. 100)
	nextRewardName: string | null; // Nombre (ej. "Café Gratis")
}

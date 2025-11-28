import type { Promotion } from "@/src/core/entities/Promotion";

export interface IPromotionRepository {
	// Obtener todas las promociones de un negocio
	getPromotionsByBusiness(businessId: string): Promise<Promotion[]>;

	// Obtener una promoción por ID
	getPromotionById(id: string): Promise<Promotion | null>;

	// Crear una nueva promoción
	createPromotion(
		promotion: Omit<Promotion, "id" | "createdAt" | "updatedAt">,
	): Promise<Promotion>;

	// Actualizar una promoción
	updatePromotion(
		id: string,
		promotion: Partial<Promotion>,
	): Promise<Promotion>;

	// Eliminar una promoción
	deletePromotion(id: string): Promise<boolean>;

	// Cambiar estado de activación
	togglePromotionStatus(id: string, isActive: boolean): Promise<Promotion>;
}

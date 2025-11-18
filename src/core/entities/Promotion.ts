/**
 * Entidad de dominio: Promoción
 *
 * Representa una promoción temporal creada por un negocio.
 */
export interface Promotion {
  id: string;
  businessId: string;
  title: string;
  content: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  imageUrl?: string | null; // ✅ Agregado
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * DTO para crear una nueva promoción
 */
export interface CreatePromotionDTO {
	/** ID del negocio */
	businessId: string;

	/** Título de la promoción */
	title: string;

	/** Contenido de la promoción */
	content: string;

	/** Fecha de inicio (opcional, default: ahora) */
	startDate?: Date;

	/** Fecha de fin (opcional) */
	endDate?: Date;

	/** Estado activo (opcional, default: true) */
	isActive?: boolean;
}

/**
 * DTO para actualizar una promoción existente
 */
export interface UpdatePromotionDTO {
	/** Nuevo título */
	title?: string;

	/** Nuevo contenido */
	content?: string;

	/** Nueva fecha de inicio */
	startDate?: Date;

	/** Nueva fecha de fin */
	endDate?: Date;

	/** Nuevo estado activo */
	isActive?: boolean;
}

/**
 * Entidad de dominio: Promoción
 *
 * Representa una promoción temporal creada por un negocio.
 */
export interface Promotion {
	/** Identificador único de la promoción */
	id: string;

	/** Fecha de creación */
	createdAt: Date;

	/** Fecha de última actualización */
	updatedAt: Date;

	/** ID del negocio que ofrece la promoción */
	businessId: string;

	/** Título de la promoción */
	title: string;

	/** Contenido/descripción de la promoción */
	content: string;

	/** Fecha de inicio de la promoción */
	startDate: Date;

	/** Fecha de fin de la promoción (opcional) */
	endDate?: Date;

	/** Indica si la promoción está activa */
	isActive: boolean;
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

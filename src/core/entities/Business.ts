/**
 * Categorías de negocios disponibles
 */
export type BusinessCategory =
	| "food" // Comida general
	| "cafe" // Cafetería
	| "restaurant" // Restaurante
	| "retail" // Tiendas de retail/ropa
	| "services" // Servicios
	| "entertainment" // Entretenimiento
	| "health" // Salud y bienestar
	| "other"; // Otros

/**
 * Entidad de dominio: Negocio
 *
 * Representa un negocio registrado en la plataforma PuntoFiel.
 */
export interface Business {
	/** Identificador único del negocio */
	id: string;

	/** Fecha de creación del negocio */
	createdAt: Date;

	/** Fecha de última actualización */
	updatedAt: Date;

	/** ID del dueño del negocio (referencia a profiles) */
	ownerId: string;

	/** Nombre del negocio */
	name: string;

	/** Categoría del negocio */
	category: BusinessCategory;

	/** Dirección física del negocio */
	locationAddress?: string;

	/** Horarios de atención */
	openingHours?: string;

	/** URL del logo del negocio */
	logoUrl?: string;
}

/**
 * DTO para crear un nuevo negocio
 */
export interface CreateBusinessDTO {
	/** ID del dueño del negocio */
	ownerId: string;

	/** Nombre del negocio */
	name: string;

	/** Categoría del negocio */
	category: BusinessCategory;

	/** Dirección física del negocio */
	locationAddress?: string;

	/** Horarios de atención */
	openingHours?: string;

	/** URL del logo del negocio */
	logoUrl?: string;
}

/**
 * DTO para actualizar un negocio existente
 */
export interface UpdateBusinessDTO {
	/** Nuevo nombre del negocio */
	name?: string;

	/** Nueva categoría */
	category?: BusinessCategory;

	/** Nueva dirección */
	locationAddress?: string;

	/** Nuevos horarios */
	openingHours?: string;

	/** Nueva URL del logo */
	logoUrl?: string;
}

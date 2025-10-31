/**
 * Entidad de dominio: Empleado
 *
 * Representa la relación entre un empleado y un negocio.
 */
export interface Employee {
	/** Identificador único del empleado */
	id: number;

	/** Fecha de creación del registro */
	createdAt: Date;

	/** ID del negocio al que pertenece */
	businessId: string;

	/** ID del perfil del empleado (referencia a profiles) */
	profileId: string;
}

/**
 * DTO para crear un nuevo empleado
 */
export interface CreateEmployeeDTO {
	/** ID del negocio */
	businessId: string;

	/** ID del perfil del empleado */
	profileId: string;
}

/**
 * Entidad de dominio: Empleado
 *
 * Representa la relación entre un empleado y un negocio.
 */
export interface Employee {
	/** Identificador único del empleado */
	id: number;

	/** ID del negocio al que pertenece */
	businessId: string;

	/** ID del perfil del empleado (referencia a profiles) */
	profileId: string;

	/** Status del empleado */
	isActive: boolean;

	/** Fecha de creación del registro */
	createdAt: string;

	// Datos del perfil relacionado
	profile: {
		firstName: string;
		lastName: string | null;
		secondLastName: string | null;
		email: string;
	};
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

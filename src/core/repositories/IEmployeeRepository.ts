import type { Employee } from "@/src/core/entities/Employee";

/**
 * Interfaz para el repositorio de empleados
 */
export interface IEmployeeRepository {
	/**
	 * Obtiene todos los empleados activos de un negocio
	 */
	getEmployeesByBusiness(businessId: string): Promise<Employee[]>;

	/**
	 * Obtiene un empleado por su ID (solo si está activo)
	 */
	getEmployeeById(employeeId: number): Promise<Employee | null>;

	/**
	 * Crea un nuevo empleado
	 */
	createEmployee(employeeData: {
		firstName: string;
		lastName: string;
		secondLastName?: string;
		email: string;
		password: string;
		businessId: string;
	}): Promise<Employee>;

	/**
	 * Actualiza un empleado existente
	 */
	updateEmployee(
		employeeId: number,
		employeeData: {
			firstName: string;
			lastName: string;
			secondLastName?: string;
			email: string;
			password?: string;
		},
	): Promise<Employee>;

	/**
	 * Desactiva un empleado (borrado lógico)
	 * Cambia is_active a false en lugar de eliminar el registro
	 */
	deleteEmployee(employeeId: number): Promise<void>;
}

import type { Employee } from "@/src/core/entities/Employee";
import type { IEmployeeRepository } from "@/src/core/repositories/IEmployeeRepository";

/**
 * Caso de uso: Crear un nuevo empleado
 */
export class CreateEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute(employeeData: {
		firstName: string;
		lastName: string;
		secondLastName?: string;
		email: string;
		password: string;
		businessId: string;
	}): Promise<Employee> {
		// Validaciones de negocio
		if (!employeeData.firstName.trim()) {
			throw new Error("El nombre es requerido");
		}

		if (!employeeData.lastName.trim()) {
			throw new Error("El apellido es requerido");
		}

		if (!employeeData.email.trim()) {
			throw new Error("El email es requerido");
		}

		if (!employeeData.password || employeeData.password.length < 8) {
			throw new Error("La contraseña debe tener al menos 8 caracteres");
		}

		if (!employeeData.businessId) {
			throw new Error("El ID del negocio es requerido");
		}

		return await this.employeeRepository.createEmployee(employeeData);
	}
}

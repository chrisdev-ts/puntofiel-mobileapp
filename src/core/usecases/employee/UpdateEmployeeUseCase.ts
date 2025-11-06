import type { Employee } from "@/src/core/entities/Employee";
import type { IEmployeeRepository } from "@/src/core/repositories/IEmployeeRepository";

/**
 * Caso de uso para actualizar un empleado
 */
export class UpdateEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute(
		employeeId: number,
		employeeData: {
			firstName: string;
			lastName: string;
			secondLastName?: string;
			email: string;
			password?: string;
		},
	): Promise<Employee> {
		return await this.employeeRepository.updateEmployee(
			employeeId,
			employeeData,
		);
	}
}

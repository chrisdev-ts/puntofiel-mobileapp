import type { IEmployeeRepository } from "@/src/core/repositories/IEmployeeRepository";

/**
 * Caso de uso para desactivar un empleado (borrado lógico)
 */
export class DeleteEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute(employeeId: number): Promise<void> {
		return await this.employeeRepository.deleteEmployee(employeeId);
	}
}

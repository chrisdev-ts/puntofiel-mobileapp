import type { Employee } from "@/src/core/entities/Employee";
import type { IEmployeeRepository } from "@/src/core/repositories/IEmployeeRepository";

/**
 * Caso de uso para obtener empleados de un negocio
 */
export class GetEmployeeUseCase {
	constructor(private employeeRepository: IEmployeeRepository) {}

	async execute(businessId: string): Promise<Employee[]> {
		return await this.employeeRepository.getEmployeesByBusiness(businessId);
	}
}

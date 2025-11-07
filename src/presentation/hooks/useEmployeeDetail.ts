import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@/src/core/entities/Employee";
import { SupabaseEmployeeRepository } from "@/src/infrastructure/repositories/SupabaseEmployeeRepository";

const employeeRepository = new SupabaseEmployeeRepository();

/**
 * Hook para obtener el detalle de un empleado por ID
 */
export function useEmployeeDetail(employeeId: number | undefined) {
	return useQuery<Employee, Error>({
		queryKey: ["employee", employeeId],
		queryFn: async () => {
			if (!employeeId) {
				throw new Error("ID de empleado requerido");
			}

			const employee = await employeeRepository.getEmployeeById(employeeId);

			if (!employee) {
				throw new Error("Empleado no encontrado");
			}

			return employee;
		},
		enabled: !!employeeId,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
}

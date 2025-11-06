import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateEmployeeUseCase } from "@/src/core/usecases/employee/CreateEmployeeUseCase";
import { DeleteEmployeeUseCase } from "@/src/core/usecases/employee/DeleteEmployeeUseCase";
import { GetEmployeeUseCase } from "@/src/core/usecases/employee/GetEmployeeUseCase";
import { UpdateEmployeeUseCase } from "@/src/core/usecases/employee/UpdateEmployeeUseCase";
import { SupabaseEmployeeRepository } from "@/src/infrastructure/repositories/SupabaseEmployeeRepository";
import { useTemporaryPasswordStore } from "@/src/presentation/stores/temporaryPasswordStore"; // ✅ AGREGADO


const employeeRepository = new SupabaseEmployeeRepository();
const getEmployeeUseCase = new GetEmployeeUseCase(employeeRepository);
const createEmployeeUseCase = new CreateEmployeeUseCase(employeeRepository);
const updateEmployeeUseCase = new UpdateEmployeeUseCase(employeeRepository);
const deleteEmployeeUseCase = new DeleteEmployeeUseCase(employeeRepository);

/**
 * Hook para gestionar empleados
 */
export function useEmployee(businessId: string | undefined) {
	const queryClient = useQueryClient();
	const { addPassword } = useTemporaryPasswordStore();

	// Obtener lista de empleados
	const {
		data: employees = [],
		isLoading: isLoadingEmployees,
		error: employeesError,
	} = useQuery({
		queryKey: ["employees", businessId],
		queryFn: () => getEmployeeUseCase.execute(businessId!),
		enabled: !!businessId,
	});

	// Crear empleado
	const {
		mutate: createEmployee,
		isPending: isCreatingEmployee,
		error: createEmployeeError,
	} = useMutation({
		mutationFn: async (data: {
			firstName: string;
			lastName: string;
			secondLastName?: string;
			email: string;
			password: string;
			businessId: string;
		}) => {
			const employee = await createEmployeeUseCase.execute(data);
			//Guardar temporalmente password de empleado recien registrado
			addPassword(employee.id, data.password);
			return employee;
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees", businessId] });
		},
	});

	// Actualizar empleado
	const {
		mutate: updateEmployee,
		isPending: isUpdatingEmployee,
		error: updateEmployeeError,
	} = useMutation({
		mutationFn: async ({
			employeeId,
			data,
		}: {
			employeeId: number;
			data: {
				firstName: string;
				lastName: string;
				secondLastName?: string;
				email: string;
				password?: string;
			};
		}) => {
			const employee = await updateEmployeeUseCase.execute(employeeId, data);
			if (data.password && data.password.length > 0) {
				addPassword(employeeId, data.password);
			}
			return employee;
		},

		onSuccess: (_, variables) => {
			// Invalidar la lista de empleados
			queryClient.invalidateQueries({ queryKey: ["employees", businessId] });
			// Invalidar el detalle del empleado actualizado
			queryClient.invalidateQueries({
				queryKey: ["employee", variables.employeeId],
			});
		},
	});

	// Eliminar empleado, solo se desactiva
	const {
		mutate: deleteEmployee,
		isPending: isDeletingEmployee,
		error: deleteEmployeeError,
	} = useMutation({
		mutationFn: (employeeId: number) =>
			deleteEmployeeUseCase.execute(employeeId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["employees", businessId] });
		},
	});

	return {
		employees,
		isLoadingEmployees,
		employeesError,
		createEmployee,
		isCreatingEmployee,
		createEmployeeError,
		updateEmployee,
		isUpdatingEmployee,
		updateEmployeeError,
		deleteEmployee,
		isDeletingEmployee,
		deleteEmployeeError,
	};
}

/**
 * Test unitario para CreateEmployeeUseCase
 *
 * Objetivo: Probar la lógica de negocio del caso de uso de creación de empleados
 * sin depender de la implementación real del repositorio (Supabase).
 *
 * Estrategia:
 * 1. Mockear completamente IEmployeeRepository
 * 2. Probar casos de éxito
 * 3. Probar validaciones de negocio (nombre, email, contraseña, etc.)
 * 4. Probar propagación de errores del repositorio
 */

import type { Employee } from "@/src/core/entities/Employee";
import type { IEmployeeRepository } from "@/src/core/repositories/IEmployeeRepository";
import { CreateEmployeeUseCase } from "@/src/core/usecases/employee/CreateEmployeeUseCase";

describe("CreateEmployeeUseCase", () => {
	// Mock del repositorio
	let mockEmployeeRepository: jest.Mocked<IEmployeeRepository>;
	let createEmployeeUseCase: CreateEmployeeUseCase;

	// Datos de prueba válidos
	const validEmployeeData = {
		firstName: "Juan",
		lastName: "Pérez",
		secondLastName: "García",
		email: "juan.perez@test.com",
		password: "Password123!",
		businessId: "550e8400-e29b-41d4-a716-446655440000",
	};

	const mockEmployee: Employee = {
		id: 1,
		businessId: validEmployeeData.businessId,
		profileId: "123e4567-e89b-12d3-a456-426614174000",
		isActive: true,
		createdAt: "2024-01-01T00:00:00Z",
		profile: {
			firstName: validEmployeeData.firstName,
			lastName: validEmployeeData.lastName,
			secondLastName: validEmployeeData.secondLastName,
			email: validEmployeeData.email,
		},
	};

	beforeEach(() => {
		// Crear mock del repositorio
		mockEmployeeRepository = {
			createEmployee: jest.fn(),
			getEmployeesByBusiness: jest.fn(),
			getEmployeeById: jest.fn(),
			updateEmployee: jest.fn(),
			deleteEmployee: jest.fn(),
		};

		// Instanciar el use case
		createEmployeeUseCase = new CreateEmployeeUseCase(mockEmployeeRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("Casos de éxito", () => {
		it("debe crear un empleado con todos los datos válidos", async () => {
			// Arrange
			mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);

			// Act
			const result = await createEmployeeUseCase.execute(validEmployeeData);

			// Assert
			expect(result).toEqual(mockEmployee);
			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledTimes(1);
			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith(
				validEmployeeData,
			);
		});

		it("debe crear un empleado sin segundo apellido (campo opcional)", async () => {
			// Arrange
			const dataWithoutSecondLastName = {
				...validEmployeeData,
				secondLastName: undefined,
			};
			const employeeWithoutSecondLastName: Employee = {
				...mockEmployee,
				profile: {
					...mockEmployee.profile,
					secondLastName: null,
				},
			};
			mockEmployeeRepository.createEmployee.mockResolvedValue(
				employeeWithoutSecondLastName,
			);

			// Act
			const result = await createEmployeeUseCase.execute(
				dataWithoutSecondLastName,
			);

			// Assert
			expect(result).toEqual(employeeWithoutSecondLastName);
			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith(
				dataWithoutSecondLastName,
			);
		});

		it("debe pasar los datos exactos al repositorio", async () => {
			// Arrange
			mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);

			// Act
			await createEmployeeUseCase.execute(validEmployeeData);

			// Assert
			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith({
				firstName: validEmployeeData.firstName,
				lastName: validEmployeeData.lastName,
				secondLastName: validEmployeeData.secondLastName,
				email: validEmployeeData.email,
				password: validEmployeeData.password,
				businessId: validEmployeeData.businessId,
			});
		});
	});

	describe("Validaciones - Campo firstName", () => {
		it("debe lanzar error si firstName está vacío", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				firstName: "",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El nombre es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});

		it("debe lanzar error si firstName solo contiene espacios", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				firstName: "   ",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El nombre es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});
	});

	describe("Validaciones - Campo lastName", () => {
		it("debe lanzar error si lastName está vacío", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				lastName: "",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El apellido es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});

		it("debe lanzar error si lastName solo contiene espacios", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				lastName: "   ",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El apellido es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});
	});

	describe("Validaciones - Campo email", () => {
		it("debe lanzar error si email está vacío", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				email: "",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El email es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});

		it("debe lanzar error si email solo contiene espacios", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				email: "   ",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El email es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});
	});

	describe("Validaciones - Campo password", () => {
		it("debe lanzar error si password está vacío", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				password: "",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"La contraseña debe tener al menos 8 caracteres",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});

		it("debe lanzar error si password tiene menos de 8 caracteres", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				password: "Pass12!", // 7 caracteres
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"La contraseña debe tener al menos 8 caracteres",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});

		it("debe aceptar password con exactamente 8 caracteres", async () => {
			// Arrange
			const validData = {
				...validEmployeeData,
				password: "Pass123!", // 8 caracteres
			};
			mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);

			// Act
			await createEmployeeUseCase.execute(validData);

			// Assert
			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalled();
		});
	});

	describe("Validaciones - Campo businessId", () => {
		it("debe lanzar error si businessId está vacío", async () => {
			// Arrange
			const invalidData = {
				...validEmployeeData,
				businessId: "",
			};

			// Act & Assert
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El ID del negocio es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});
	});

	describe("Propagación de errores del repositorio", () => {
		it("debe propagar error si el email ya está registrado", async () => {
			// Arrange
			const repositoryError = new Error("El email ya está registrado");
			mockEmployeeRepository.createEmployee.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(
				createEmployeeUseCase.execute(validEmployeeData),
			).rejects.toThrow("El email ya está registrado");

			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledTimes(1);
		});

		it("debe propagar error si el negocio no existe", async () => {
			// Arrange
			const repositoryError = new Error("El negocio no existe");
			mockEmployeeRepository.createEmployee.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(
				createEmployeeUseCase.execute(validEmployeeData),
			).rejects.toThrow("El negocio no existe");
		});

		it("debe propagar error de conexión a la base de datos", async () => {
			// Arrange
			const repositoryError = new Error("Error de conexión a la base de datos");
			mockEmployeeRepository.createEmployee.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(
				createEmployeeUseCase.execute(validEmployeeData),
			).rejects.toThrow("Error de conexión a la base de datos");
		});
	});

	describe("Validaciones combinadas", () => {
		it("debe lanzar error en el primer campo inválido (firstName)", async () => {
			// Arrange - Múltiples campos inválidos
			const invalidData = {
				firstName: "",
				lastName: "",
				email: "",
				password: "123",
				businessId: "",
			};

			// Act & Assert
			// Debe fallar en firstName (primera validación)
			await expect(createEmployeeUseCase.execute(invalidData)).rejects.toThrow(
				"El nombre es requerido",
			);

			expect(mockEmployeeRepository.createEmployee).not.toHaveBeenCalled();
		});
	});

	describe("Casos edge", () => {
		it("debe aceptar nombres con caracteres especiales válidos", async () => {
			// Arrange
			const dataWithSpecialChars = {
				...validEmployeeData,
				firstName: "José María",
				lastName: "O'Connor",
			};
			mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);

			// Act
			await createEmployeeUseCase.execute(dataWithSpecialChars);

			// Assert
			expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith(
				dataWithSpecialChars,
			);
		});

		it("debe manejar correctamente businessId con formato UUID", async () => {
			// Arrange
			const validUUIDs = [
				"550e8400-e29b-41d4-a716-446655440000",
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
			];

			for (const uuid of validUUIDs) {
				const data = { ...validEmployeeData, businessId: uuid };
				mockEmployeeRepository.createEmployee.mockResolvedValue(mockEmployee);

				// Act
				await createEmployeeUseCase.execute(data);

				// Assert
				expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith(
					data,
				);
			}
		});
	});
});

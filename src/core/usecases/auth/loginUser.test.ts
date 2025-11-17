/**
 * Test unitario para LoginUserUseCase
 *
 * Objetivo: Probar la lógica de negocio del caso de uso de login
 * sin depender de la implementación real del repositorio (Supabase).
 *
 * Estrategia:
 * 1. Mockear completamente IUserRepository
 * 2. Probar casos de éxito
 * 3. Probar casos de fallo (validaciones)
 * 4. Probar propagación de errores del repositorio
 */

import type { LoginUserDTO, User } from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { LoginUserUseCase } from "@/src/core/usecases/auth/loginUser";

describe("LoginUserUseCase", () => {
	// Mock del repositorio
	let mockUserRepository: jest.Mocked<IUserRepository>;
	let loginUserUseCase: LoginUserUseCase;

	// Datos de prueba
	const validCredentials: LoginUserDTO = {
		email: "usuario@test.com",
		password: "Password123!",
	};

	const mockUser: User = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		email: "usuario@test.com",
		firstName: "Juan",
		lastName: "Pérez",
		secondLastName: "García",
		phone: "+525512345678",
		role: "customer",
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
	};

	beforeEach(() => {
		// Crear un mock del repositorio antes de cada test
		mockUserRepository = {
			loginUser: jest.fn(),
			createUser: jest.fn(),
			getUserById: jest.fn(),
		};

		// Instanciar el use case con el repositorio mockeado
		loginUserUseCase = new LoginUserUseCase(mockUserRepository);

		// Limpiar mocks de console.log para evitar ruido en tests
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe("Casos de éxito", () => {
		it("debe autenticar un usuario con credenciales válidas", async () => {
			// Arrange (Preparar)
			mockUserRepository.loginUser.mockResolvedValue(mockUser);

			// Act (Actuar)
			const result = await loginUserUseCase.execute(validCredentials);

			// Assert (Verificar)
			expect(result).toEqual(mockUser);
			expect(mockUserRepository.loginUser).toHaveBeenCalledTimes(1);
			expect(mockUserRepository.loginUser).toHaveBeenCalledWith(
				validCredentials,
			);
		});

		it("debe llamar al repositorio con los datos exactos proporcionados", async () => {
			// Arrange
			const credentials: LoginUserDTO = {
				email: "otro@test.com",
				password: "OtraPassword456!",
			};
			mockUserRepository.loginUser.mockResolvedValue({
				...mockUser,
				email: credentials.email,
			});

			// Act
			await loginUserUseCase.execute(credentials);

			// Assert
			expect(mockUserRepository.loginUser).toHaveBeenCalledWith({
				email: credentials.email,
				password: credentials.password,
			});
		});
	});

	describe("Validaciones - Casos de fallo", () => {
		it("debe lanzar error si el email está vacío", async () => {
			// Arrange
			const invalidCredentials: LoginUserDTO = {
				email: "",
				password: "Password123!",
			};

			// Act & Assert
			await expect(
				loginUserUseCase.execute(invalidCredentials),
			).rejects.toThrow("Email y contraseña son requeridos");

			// Verificar que NO se llamó al repositorio
			expect(mockUserRepository.loginUser).not.toHaveBeenCalled();
		});

		it("debe lanzar error si la contraseña está vacía", async () => {
			// Arrange
			const invalidCredentials: LoginUserDTO = {
				email: "usuario@test.com",
				password: "",
			};

			// Act & Assert
			await expect(
				loginUserUseCase.execute(invalidCredentials),
			).rejects.toThrow("Email y contraseña son requeridos");

			expect(mockUserRepository.loginUser).not.toHaveBeenCalled();
		});

		it("debe lanzar error si el email no tiene formato válido", async () => {
			// Arrange
			const invalidCredentials: LoginUserDTO = {
				email: "emailinvalido",
				password: "Password123!",
			};

			// Act & Assert
			await expect(
				loginUserUseCase.execute(invalidCredentials),
			).rejects.toThrow("Formato de email inválido");

			expect(mockUserRepository.loginUser).not.toHaveBeenCalled();
		});

		it("debe lanzar error si ambos campos están vacíos", async () => {
			// Arrange
			const invalidCredentials: LoginUserDTO = {
				email: "",
				password: "",
			};

			// Act & Assert
			await expect(
				loginUserUseCase.execute(invalidCredentials),
			).rejects.toThrow("Email y contraseña son requeridos");

			expect(mockUserRepository.loginUser).not.toHaveBeenCalled();
		});
	});

	describe("Propagación de errores del repositorio", () => {
		it("debe propagar error si el repositorio lanza error de credenciales inválidas", async () => {
			// Arrange
			const repositoryError = new Error("Credenciales inválidas");
			mockUserRepository.loginUser.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(loginUserUseCase.execute(validCredentials)).rejects.toThrow(
				"Credenciales inválidas",
			);

			expect(mockUserRepository.loginUser).toHaveBeenCalledTimes(1);
		});

		it("debe propagar error si el repositorio lanza error de conexión", async () => {
			// Arrange
			const repositoryError = new Error(
				"Error de conexión con la base de datos",
			);
			mockUserRepository.loginUser.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(loginUserUseCase.execute(validCredentials)).rejects.toThrow(
				"Error de conexión con la base de datos",
			);
		});

		it("debe propagar error si el email no está verificado", async () => {
			// Arrange
			const repositoryError = new Error("El email no ha sido verificado");
			mockUserRepository.loginUser.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(loginUserUseCase.execute(validCredentials)).rejects.toThrow(
				"El email no ha sido verificado",
			);
		});
	});

	describe("Flujo completo", () => {
		it("debe ejecutar el flujo completo: validar -> autenticar -> retornar usuario", async () => {
			// Arrange
			mockUserRepository.loginUser.mockResolvedValue(mockUser);

			// Act
			const result = await loginUserUseCase.execute(validCredentials);

			// Assert
			// 1. Verificar que se retornó el usuario correcto
			expect(result).toBeDefined();
			expect(result.id).toBe(mockUser.id);
			expect(result.email).toBe(validCredentials.email);
			expect(result.role).toBe("customer");

			// 2. Verificar que se llamó al repositorio exactamente una vez
			expect(mockUserRepository.loginUser).toHaveBeenCalledTimes(1);

			// 3. Verificar los datos completos del usuario
			expect(result).toMatchObject({
				id: expect.any(String),
				email: expect.any(String),
				firstName: expect.any(String),
				lastName: expect.any(String),
				role: expect.any(String),
			});
		});
	});
});

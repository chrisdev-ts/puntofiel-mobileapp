/**
 * Test unitario para CreateRewardUseCase
 *
 * Objetivo: Probar la lógica de negocio del caso de uso de creación de recompensas
 * sin depender de la implementación real del repositorio (Supabase).
 *
 * Estrategia:
 * 1. Mockear completamente IRewardRepository
 * 2. Probar casos de éxito (con y sin imagen)
 * 3. Probar validaciones de negocio
 * 4. Probar propagación de errores del repositorio
 */

import type { CreateRewardDTO, Reward } from "@/src/core/entities/Reward";
import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";
import { CreateRewardUseCase } from "@/src/core/usecases/reward/CreateRewardUseCase";

describe("CreateRewardUseCase", () => {
	// Mock del repositorio
	let mockRewardRepository: jest.Mocked<IRewardRepository>;
	let createRewardUseCase: CreateRewardUseCase;

	// Datos de prueba válidos
	const validRewardDTO: CreateRewardDTO = {
		businessId: "550e8400-e29b-41d4-a716-446655440000",
		name: "Café Gratis",
		description: "Un café de cualquier tamaño",
		pointsRequired: 100,
	};

	const mockReward: Reward = {
		id: "123e4567-e89b-12d3-a456-426614174000",
		businessId: validRewardDTO.businessId,
		name: validRewardDTO.name,
		description: validRewardDTO.description,
		pointsRequired: validRewardDTO.pointsRequired,
		imageUrl: undefined,
		isActive: true,
		createdAt: new Date("2024-01-01T00:00:00Z"),
		updatedAt: new Date("2024-01-01T00:00:00Z"),
	};

	beforeEach(() => {
		// Crear mock del repositorio
		mockRewardRepository = {
			createReward: jest.fn(),
			getRewardsByBusiness: jest.fn(),
			getRewardById: jest.fn(),
			updateReward: jest.fn(),
			deleteReward: jest.fn(),
		};

		// Instanciar el use case
		createRewardUseCase = new CreateRewardUseCase(mockRewardRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("Casos de éxito", () => {
		it("debe crear una recompensa con datos válidos (sin imagen)", async () => {
			// Arrange
			mockRewardRepository.createReward.mockResolvedValue(mockReward);

			// Act
			const result = await createRewardUseCase.execute(validRewardDTO);

			// Assert
			expect(result).toEqual(mockReward);
			expect(mockRewardRepository.createReward).toHaveBeenCalledTimes(1);
			expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
				validRewardDTO,
				undefined,
			);
		});

		it("debe crear una recompensa con imagen", async () => {
			// Arrange
			const imageUri = "file:///path/to/image.jpg";
			const rewardWithImage = {
				...mockReward,
				imageUrl: "https://storage.supabase.co/rewards/image.jpg",
			};
			mockRewardRepository.createReward.mockResolvedValue(rewardWithImage);

			// Act
			const result = await createRewardUseCase.execute(
				validRewardDTO,
				imageUri,
			);

			// Assert
			expect(result).toEqual(rewardWithImage);
			expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
				validRewardDTO,
				imageUri,
			);
			expect(result.imageUrl).toBeDefined();
		});

		it("debe crear una recompensa sin descripción (campo opcional)", async () => {
			// Arrange
			const dtoWithoutDescription: CreateRewardDTO = {
				businessId: validRewardDTO.businessId,
				name: "Descuento 10%",
				pointsRequired: 50,
			};
			const rewardWithoutDescription = {
				...mockReward,
				name: "Descuento 10%",
				description: undefined,
				pointsRequired: 50,
			};
			mockRewardRepository.createReward.mockResolvedValue(
				rewardWithoutDescription,
			);

			// Act
			const result = await createRewardUseCase.execute(dtoWithoutDescription);

			// Assert
			expect(result).toEqual(rewardWithoutDescription);
			expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
				dtoWithoutDescription,
				undefined,
			);
		});

		it("debe pasar los datos exactos al repositorio", async () => {
			// Arrange
			mockRewardRepository.createReward.mockResolvedValue(mockReward);

			// Act
			await createRewardUseCase.execute(validRewardDTO);

			// Assert
			expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
				expect.objectContaining({
					businessId: validRewardDTO.businessId,
					name: validRewardDTO.name,
					description: validRewardDTO.description,
					pointsRequired: validRewardDTO.pointsRequired,
				}),
				undefined,
			);
		});
	});

	describe("Validaciones - Campo name", () => {
		it("debe lanzar error si el name está vacío", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				name: "",
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"El nombre debe tener al menos 3 caracteres",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});

		it("debe lanzar error si el name solo contiene espacios", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				name: "   ",
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"El nombre debe tener al menos 3 caracteres",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});

		it("debe lanzar error si el name tiene menos de 3 caracteres", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				name: "Ab", // 2 caracteres
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"El nombre debe tener al menos 3 caracteres",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});

		it("debe aceptar name con exactamente 3 caracteres", async () => {
			// Arrange
			const validDTO: CreateRewardDTO = {
				...validRewardDTO,
				name: "ABC", // 3 caracteres
			};
			mockRewardRepository.createReward.mockResolvedValue(mockReward);

			// Act
			await createRewardUseCase.execute(validDTO);

			// Assert
			expect(mockRewardRepository.createReward).toHaveBeenCalled();
		});
	});

	describe("Validaciones - Campo pointsRequired", () => {
		it("debe lanzar error si pointsRequired es 0", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				pointsRequired: 0,
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"Los puntos requeridos deben ser mayores a 0",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});

		it("debe lanzar error si pointsRequired es negativo", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				pointsRequired: -10,
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"Los puntos requeridos deben ser mayores a 0",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});

		it("debe aceptar pointsRequired con valor 1 (mínimo válido)", async () => {
			// Arrange
			const validDTO: CreateRewardDTO = {
				...validRewardDTO,
				pointsRequired: 1,
			};
			mockRewardRepository.createReward.mockResolvedValue(mockReward);

			// Act
			await createRewardUseCase.execute(validDTO);

			// Assert
			expect(mockRewardRepository.createReward).toHaveBeenCalled();
		});

		it("debe aceptar pointsRequired con valores grandes", async () => {
			// Arrange
			const validDTO: CreateRewardDTO = {
				...validRewardDTO,
				pointsRequired: 10000,
			};
			mockRewardRepository.createReward.mockResolvedValue(mockReward);

			// Act
			await createRewardUseCase.execute(validDTO);

			// Assert
			expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
				expect.objectContaining({ pointsRequired: 10000 }),
				undefined,
			);
		});
	});

	describe("Validaciones - Campo businessId", () => {
		it("debe lanzar error si businessId está vacío", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				businessId: "",
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"El ID del negocio es requerido",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});

		it("debe lanzar error si businessId solo contiene espacios", async () => {
			// Arrange
			const invalidDTO: CreateRewardDTO = {
				...validRewardDTO,
				businessId: "   ",
			};

			// Act & Assert
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"El ID del negocio es requerido",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});
	});

	describe("Propagación de errores del repositorio", () => {
		it("debe propagar error si el negocio no existe", async () => {
			// Arrange
			const repositoryError = new Error("El negocio no existe");
			mockRewardRepository.createReward.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(createRewardUseCase.execute(validRewardDTO)).rejects.toThrow(
				"El negocio no existe",
			);

			expect(mockRewardRepository.createReward).toHaveBeenCalledTimes(1);
		});

		it("debe propagar error si falla la subida de imagen", async () => {
			// Arrange
			const imageUri = "file:///path/to/image.jpg";
			const repositoryError = new Error("Error al subir la imagen");
			mockRewardRepository.createReward.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(
				createRewardUseCase.execute(validRewardDTO, imageUri),
			).rejects.toThrow("Error al subir la imagen");
		});

		it("debe propagar error de conexión a la base de datos", async () => {
			// Arrange
			const repositoryError = new Error("Error de conexión a la base de datos");
			mockRewardRepository.createReward.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(createRewardUseCase.execute(validRewardDTO)).rejects.toThrow(
				"Error de conexión a la base de datos",
			);
		});

		it("debe propagar error de permisos insuficientes", async () => {
			// Arrange
			const repositoryError = new Error(
				"No tienes permisos para crear recompensas",
			);
			mockRewardRepository.createReward.mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(createRewardUseCase.execute(validRewardDTO)).rejects.toThrow(
				"No tienes permisos para crear recompensas",
			);
		});
	});

	describe("Validaciones combinadas", () => {
		it("debe validar todos los campos en orden (name primero)", async () => {
			// Arrange - Múltiples campos inválidos
			const invalidDTO: CreateRewardDTO = {
				businessId: "",
				name: "",
				pointsRequired: -1,
			};

			// Act & Assert
			// Debe fallar en name (primera validación)
			await expect(createRewardUseCase.execute(invalidDTO)).rejects.toThrow(
				"El nombre debe tener al menos 3 caracteres",
			);

			expect(mockRewardRepository.createReward).not.toHaveBeenCalled();
		});
	});

	describe("Casos edge y especiales", () => {
		it("debe manejar nombres con caracteres especiales", async () => {
			// Arrange
			const specialNames = [
				"Café ☕ Gratis",
				"10% de descuento",
				"Postre d'casa",
				"Recompensa #1",
			];

			for (const name of specialNames) {
				const dto = { ...validRewardDTO, name };
				mockRewardRepository.createReward.mockResolvedValue({
					...mockReward,
					name,
				});

				// Act
				await createRewardUseCase.execute(dto);

				// Assert
				expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
					expect.objectContaining({ name }),
					undefined,
				);
			}
		});

		it("debe manejar descripciones muy largas", async () => {
			// Arrange
			const longDescription = "A".repeat(1000);
			const dto: CreateRewardDTO = {
				...validRewardDTO,
				description: longDescription,
			};
			mockRewardRepository.createReward.mockResolvedValue(mockReward);

			// Act
			await createRewardUseCase.execute(dto);

			// Assert
			expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
				expect.objectContaining({ description: longDescription }),
				undefined,
			);
		});

		it("debe manejar correctamente businessId con formato UUID", async () => {
			// Arrange
			const validUUIDs = [
				"550e8400-e29b-41d4-a716-446655440000",
				"6ba7b810-9dad-11d1-80b4-00c04fd430c8",
				"7c9e6679-7425-40de-944b-e07fc1f90ae7",
			];

			for (const uuid of validUUIDs) {
				const dto = { ...validRewardDTO, businessId: uuid };
				mockRewardRepository.createReward.mockResolvedValue(mockReward);

				// Act
				await createRewardUseCase.execute(dto);

				// Assert
				expect(mockRewardRepository.createReward).toHaveBeenCalledWith(
					expect.objectContaining({ businessId: uuid }),
					undefined,
				);
			}
		});
	});
});

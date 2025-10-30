import { useMutation } from "@tanstack/react-query";
import type { CreateUserDTO, LoginUserDTO } from "@/src/core/entities/User";
import { LoginUserUseCase } from "@/src/core/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/src/core/usecases/auth/registerUser";
import { SupabaseUserRepository } from "@/src/infrastructure/repositories/SupabaseUserRepository";

// Instanciar dependencias siguiendo Inversión de Dependencia
const userRepository = new SupabaseUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);

/**
 * Hook personalizado para gestión de autenticación en PuntoFiel.
 *
 * Conecta la capa de presentación con los casos de uso del core,
 * manteniendo la separación de responsabilidades.
 */
export const useAuth = () => {
	// Mutación para registrar usuario
	const registerMutation = useMutation({
		mutationFn: async (userData: CreateUserDTO) => {
			console.log("[useAuth] Ejecutando caso de uso de registro...");
			console.log("[useAuth] Datos a registrar:", {
				email: userData.email,
				firstName: userData.firstName,
				lastName: userData.lastName,
				role: userData.role,
				hasSecondLastName: !!userData.secondLastName,
			});

			try {
				const result = await registerUserUseCase.execute(userData);
				console.log("[useAuth] Registro exitoso");
				return result;
			} catch (error) {
				console.error("[useAuth] Error en registro:", error);
				throw error;
			}
		},
	});

	// Mutación para iniciar sesión
	const loginMutation = useMutation({
		mutationFn: async (credentials: LoginUserDTO) => {
			console.log("[useAuth] Ejecutando caso de uso de login...");
			console.log("[useAuth] Email de login:", credentials.email);

			try {
				const result = await loginUserUseCase.execute(credentials);
				console.log("[useAuth] Login exitoso");
				return result;
			} catch (error) {
				console.error("[useAuth] Error en login:", error);
				throw error;
			}
		},
	});

	return {
		// Estado del usuario actual (temporal - será reemplazado por Zustand store)
		user: null, // Por ahora null, se implementará el estado global después
		isLoading: false, // Por ahora false, se implementará la verificación de sesión después

		// Funciones de registro
		register: (
			userData: CreateUserDTO,
			callbacks?: {
				onSuccess?: (user: any) => void;
				onError?: (error: Error) => void;
			},
		) => {
			registerMutation.mutate(userData, {
				onSuccess: (user) => {
					console.log("[useAuth] Usuario registrado exitosamente:", user.id);
					callbacks?.onSuccess?.(user);
				},
				onError: (error: Error) => {
					console.error("[useAuth] Error al registrar usuario:", error.message);
					console.error("[useAuth] Detalles del error:", error);
					callbacks?.onError?.(error);
				},
			});
		},
		isRegistering: registerMutation.isPending,
		registerError: registerMutation.error,
		registeredUser: registerMutation.data,

		// Funciones de login
		login: (
			credentials: LoginUserDTO,
			callbacks?: {
				onSuccess?: (user: any) => void;
				onError?: (error: Error) => void;
			},
		) => {
			loginMutation.mutate(credentials, {
				onSuccess: (user) => {
					console.log("[useAuth] Usuario autenticado exitosamente:", user.id);
					callbacks?.onSuccess?.(user);
				},
				onError: (error: Error) => {
					console.error("[useAuth] Error al iniciar sesión:", error.message);
					console.error("[useAuth] Detalles del error:", error);
					callbacks?.onError?.(error);
				},
			});
		},
		isLoggingIn: loginMutation.isPending,
		loginError: loginMutation.error,
		authenticatedUser: loginMutation.data,
	};
};

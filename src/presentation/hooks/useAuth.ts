import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
	CreateUserDTO,
	LoginUserDTO,
	User,
} from "@/src/core/entities/User";
import { LoginUserUseCase } from "@/src/core/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/src/core/usecases/auth/registerUser";
import { SupabaseUserRepository } from "@/src/infrastructure/repositories/SupabaseUserRepository";
import { supabase } from "@/src/infrastructure/services/supabase";
import { useAuthStore } from "@/src/presentation/stores/authStore";

// Instanciar dependencias siguiendo Inversión de Dependencia
const userRepository = new SupabaseUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);

/**
 * Hook personalizado para gestión de autenticación en PuntoFiel.
 *
 * Conecta la capa de presentación con los casos de uso del core,
 * manteniendo la separación de responsabilidades.
 *
 * Ahora incluye:
 * - Sincronización con Supabase Auth
 * - Persistencia de sesión en Zustand store
 * - Listener de cambios de autenticación
 */
export const useAuth = () => {
	// Estado global de autenticación
	const user = useAuthStore((state) => state.user);
	const session = useAuthStore((state) => state.session);
	const isLoading = useAuthStore((state) => state.isLoading);
	const setUser = useAuthStore((state) => state.setUser);
	const setSession = useAuthStore((state) => state.setSession);
	const setLoading = useAuthStore((state) => state.setLoading);
	const clearAuth = useAuthStore((state) => state.clearAuth);

	// Verificar sesión al montar el componente
	useEffect(() => {
		console.log("[useAuth] Inicializando listener de autenticación...");

		// 1. Verificar sesión actual
		const checkSession = async () => {
			try {
				const {
					data: { session: currentSession },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("[useAuth] Error al obtener sesión:", error);
					clearAuth();
					return;
				}

				if (currentSession) {
					console.log("[useAuth] Sesión encontrada:", currentSession.user.id);
					setSession(currentSession);

					// Obtener perfil completo del usuario
					const userProfile = await userRepository.getUserById(
						currentSession.user.id,
					);
					if (userProfile) {
						setUser(userProfile);
						console.log(
							"[useAuth] Usuario cargado:",
							userProfile.id,
							userProfile.role,
						);
					}
				} else {
					console.log("[useAuth] No hay sesión activa");
					clearAuth();
				}
			} catch (error) {
				console.error("[useAuth] Error verificando sesión:", error);
				clearAuth();
			} finally {
				setLoading(false);
			}
		};

		checkSession();

		// 2. Escuchar cambios en la autenticación
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, currentSession) => {
			console.log("[useAuth] Evento de autenticación:", event);

			if (event === "SIGNED_IN" && currentSession) {
				// IMPORTANTE: Solo procesar si el email está confirmado
				// O si la confirmación por email está deshabilitada en Supabase
				const emailConfirmed = currentSession.user.email_confirmed_at !== null;

				console.log("[useAuth] Email confirmado:", emailConfirmed);

				if (!emailConfirmed) {
					console.log(
						"[useAuth] Email no confirmado, esperando confirmación...",
					);
					// No establecer sesión ni usuario hasta que confirme el email
					// Supabase enviará otro SIGNED_IN cuando se confirme
					return;
				}

				setSession(currentSession);

				// Obtener perfil completo solo si el email está confirmado
				try {
					const userProfile = await userRepository.getUserById(
						currentSession.user.id,
					);
					if (userProfile) {
						setUser(userProfile);
						console.log(
							"[useAuth] Usuario autenticado:",
							userProfile.id,
							userProfile.role,
						);
					}
				} catch (error) {
					console.error("[useAuth] Error cargando perfil:", error);
					// Si falla, limpiar la sesión
					clearAuth();
				}
			} else if (event === "SIGNED_OUT") {
				console.log("[useAuth] Usuario cerró sesión");
				clearAuth();
			}
		});

		// Cleanup: cancelar suscripción al desmontar
		return () => {
			console.log("[useAuth] Limpiando listener de autenticación");
			subscription.unsubscribe();
		};
	}, [setUser, setSession, setLoading, clearAuth]);

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
		// Estado del usuario actual (ahora desde Zustand store)
		user,
		session,
		isLoading,

		// Funciones de registro
		register: (
			userData: CreateUserDTO,
			callbacks?: {
				onSuccess?: (user: User) => void;
				onError?: (error: Error) => void;
			},
		) => {
			registerMutation.mutate(userData, {
				onSuccess: (user) => {
					console.log("[useAuth] Usuario registrado exitosamente:", user.id);
					// Nota: No actualizamos el store aquí porque el usuario aún no ha iniciado sesión
					// Debe hacer login después de registrarse
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
				onSuccess?: (user: User) => void;
				onError?: (error: Error) => void;
			},
		) => {
			loginMutation.mutate(credentials, {
				onSuccess: (user) => {
					console.log("[useAuth] Usuario autenticado exitosamente:", user.id);
					// El estado se actualizará automáticamente via el listener onAuthStateChange
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

		// Función de logout
		logout: async () => {
			try {
				console.log("[useAuth] Cerrando sesión...");
				const { error } = await supabase.auth.signOut();
				if (error) {
					console.error("[useAuth] Error al cerrar sesión:", error);
					throw error;
				}
				console.log("[useAuth] Sesión cerrada exitosamente");
				// El estado se limpiará automáticamente via el listener onAuthStateChange
			} catch (error) {
				console.error("[useAuth] Error cerrando sesión:", error);
				throw error;
			}
		},
	};
};

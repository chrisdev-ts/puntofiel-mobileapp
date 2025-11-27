import type {
	CreateUserDTO,
	LoginUserDTO,
	User,
} from "@/src/core/entities/User";
import { LoginUserUseCase } from "@/src/core/usecases/auth/loginUser";
import { RegisterUserUseCase } from "@/src/core/usecases/auth/registerUser";
import { UpdateUserUseCase } from "@/src/core/usecases/auth/updateUser";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
// Importamos la clase sin llaves {} porque es export default
import SupabaseUserRepository from "@/src/infrastructure/repositories/SupabaseUserRepository";
import { supabase } from "@/src/infrastructure/services/supabase";
import { useAuthStore } from "@/src/presentation/stores/authStore";

// Instanciar dependencias
const userRepository = new SupabaseUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);

/**
 * Hook personalizado para gestión de autenticación en PuntoFiel.
 */
export const useAuth = () => {
	const user = useAuthStore((state) => state.user);
	const session = useAuthStore((state) => state.session);
	const isLoading = useAuthStore((state) => state.isLoading);
	const setUser = useAuthStore((state) => state.setUser);
	const setSession = useAuthStore((state) => state.setSession);
	const setLoading = useAuthStore((state) => state.setLoading);
	const clearAuth = useAuthStore((state) => state.clearAuth);

	useEffect(() => {
		console.log("[useAuth] Inicializando listener de autenticación...");

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
					setSession(currentSession);
					const userProfile = await userRepository.getUserById(
						currentSession.user.id,
					);
					if (userProfile) {
						setUser(userProfile);
					}
				} else {
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

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, currentSession) => {
			if (event === "SIGNED_IN" && currentSession) {
				const emailConfirmed = currentSession.user.email_confirmed_at !== null;
				if (!emailConfirmed) return;

				setSession(currentSession);
				try {
					const userProfile = await userRepository.getUserById(
						currentSession.user.id,
					);
					if (userProfile) {
						setUser(userProfile);
					}
				} catch (error) {
					console.error("[useAuth] Error cargando perfil:", error);
					clearAuth();
				}
			} else if (event === "SIGNED_OUT") {
				clearAuth();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setUser, setSession, setLoading, clearAuth]);

	const registerMutation = useMutation({
		mutationFn: async (userData: CreateUserDTO) => {
			return await registerUserUseCase.execute(userData);
		},
	});

	const loginMutation = useMutation({
		mutationFn: async (credentials: LoginUserDTO) => {
			return await loginUserUseCase.execute(credentials);
		},
	});

	const updateProfileMutation = useMutation({
		mutationFn: async (data: Partial<User>) => {
			if (!user) {
				throw new Error("No hay usuario autenticado para actualizar.");
			}
			// Ejecución del caso de uso. Aquí se llamará a this.userRepository.updateUser
			return await updateUserUseCase.execute(user.id, data);
		},
		onSuccess: (updatedUser) => {
			setUser(updatedUser);
		},
		onError: (error) => {
			console.error("[useAuth] Error en updateProfileMutation:", error);
		},
	});

	const updateProfileAsync = async (data: Partial<User>) => {
		return updateProfileMutation.mutateAsync(data);
	};

	return {
		user,
		session,
		isLoading,

		register: (
			userData: CreateUserDTO,
			callbacks?: {
				onSuccess?: (user: User) => void;
				onError?: (error: Error) => void;
			},
		) => {
			registerMutation.mutate(userData, {
				onSuccess: (user) => callbacks?.onSuccess?.(user),
				onError: (error: Error) => callbacks?.onError?.(error),
			});
		},
		login: (
			credentials: LoginUserDTO,
			callbacks?: {
				onSuccess?: (user: User) => void;
				onError?: (error: Error) => void;
			},
		) => {
			loginMutation.mutate(credentials, {
				onSuccess: (user) => callbacks?.onSuccess?.(user),
				onError: (error: Error) => callbacks?.onError?.(error),
			});
		},
		logout: async () => {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		},

		updateProfileAsync: updateProfileAsync,
		isUpdatingProfile: updateProfileMutation.isPending,
		updateProfileError: updateProfileMutation.error,

		isRegistering: registerMutation.isPending,
		registerError: registerMutation.error,
		isLoggingIn: loginMutation.isPending,
		loginError: loginMutation.error,
	};
};

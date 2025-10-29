import { useCallback, useEffect, useState } from "react";
import type { User } from "@/src/core/entities/User";
import { IS_DEV_MODE, MOCK_USER_ID } from "@/src/infrastructure/config/dev";
import { supabase } from "@/src/infrastructure/services/supabase";

/**
 * Hook personalizado que encapsula la lógica de autenticación
 * y proporciona información sobre el usuario actual.
 *
 * En modo desarrollo (IS_DEV_MODE), usa el MOCK_USER_ID.
 * En producción, obtiene el usuario de Supabase Auth.
 */
export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadUser = useCallback(async () => {
		setIsLoading(true);
		try {
			if (IS_DEV_MODE) {
				// En desarrollo, usar datos mock directamente sin consultar la BD
				const mockUser: User = {
					id: MOCK_USER_ID,
					first_name: "Christian",
					last_name: "Serrano",
					second_last_name: "",
					email: "christian@email.com",
					role: "customer",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				setUser(mockUser);
				setIsLoading(false);
				return;
			}

			// En producción, obtener el usuario de Supabase Auth
			const {
				data: { user: authUser },
				error: authError,
			} = await supabase.auth.getUser();

			if (authError) throw authError;
			if (!authUser) {
				setUser(null);
				setIsLoading(false);
				return;
			}

			// Obtener datos completos del usuario desde la tabla profiles
			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", authUser.id)
				.single();

			if (error) throw error;

			// Mapear los datos de profiles a la entidad User
			const userData: User = {
				id: data.id,
				first_name: data.first_name,
				last_name: data.last_name || undefined,
				second_last_name: data.second_last_name || undefined,
				email: authUser.email || "",
				role: data.role,
				created_at: authUser.created_at,
				updated_at: data.updated_at,
			};

			setUser(userData);
		} catch (error) {
			console.error("Error loading user:", error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const loadInitialUser = async () => {
			await loadUser();
		};

		loadInitialUser();

		// Escuchar cambios en la autenticación
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			if (session?.user) {
				await loadUser();
			} else {
				setUser(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [loadUser]);

	const handleLogin = async (email: string, password: string) => {
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			await loadUser();
			return { success: true };
		} catch (error) {
			console.error("Login failed:", error);
			return { success: false, error };
		}
	};

	const handleLogout = async () => {
		try {
			await supabase.auth.signOut();
			setUser(null);
			return { success: true };
		} catch (error) {
			console.error("Logout failed:", error);
			return { success: false, error };
		}
	};

	const handleRegister = async (
		email: string,
		password: string,
		firstName: string,
		lastName?: string,
		secondLastName?: string,
		role: User["role"] = "customer",
	) => {
		try {
			// 1. Crear usuario en Supabase Auth
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email,
				password,
			});

			if (authError) throw authError;
			if (!authData.user) throw new Error("No se pudo crear el usuario");

			// 2. Crear perfil de usuario en la tabla profiles
			const { error: profileError } = await supabase.from("profiles").insert({
				id: authData.user.id,
				first_name: firstName,
				last_name: lastName,
				second_last_name: secondLastName,
				role,
			});

			if (profileError) throw profileError;

			await loadUser();
			return { success: true };
		} catch (error) {
			console.error("Registration failed:", error);
			return { success: false, error };
		}
	};

	return {
		user,
		isLoading,
		handleLogin,
		handleLogout,
		handleRegister,
		refresh: loadUser,
	};
};

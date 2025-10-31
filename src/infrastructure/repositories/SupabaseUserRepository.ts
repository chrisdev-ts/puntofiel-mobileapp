// Implementación concreta del IUserRepository utilizando Supabase.
// Esta capa conoce y depende del 'core'.

import type {
	CreateUserDTO,
	LoginUserDTO,
	User,
} from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

/**
 * Implementación del repositorio de usuarios usando Supabase.
 *
 * Responsabilidades:
 * 1. Gestionar cuentas en auth.users (email, password, phone)
 * 2. Gestionar perfiles en public.profiles (firstName, lastName, secondLastName, role)
 * 3. Coordinar transacciones entre ambas tablas
 */

export class SupabaseUserRepository implements IUserRepository {
	findById(_id: string): Promise<User | null> {
		throw new Error("Method not implemented.");
	}
	findByEmail(_email: string): Promise<User | null> {
		throw new Error("Method not implemented.");
	}
	create(_user: Omit<User, "id">): Promise<User> {
		throw new Error("Method not implemented.");
	}
	/**
	 * Crea un nuevo usuario en el sistema PuntoFiel.
	 *
	 * Flujo mejorado:
	 * 1. Verificar si el email ya existe antes del signUp
	 * 2. Crear cuenta en Supabase Auth con email, password y phone en metadata
	 * 3. Crear perfil en tabla profiles con nombres y rol
	 * 4. Hacer rollback si algo falla
	 */
	async createUser(userData: CreateUserDTO): Promise<User> {
		console.log("Iniciando registro de usuario:", userData.email);

		try {
			// 1. VERIFICACIÓN PREVIA: Comprobar si el email ya está registrado
			console.log("Verificando si el email ya existe...");
			const existingUser = await this.checkEmailExists(userData.email);
			if (existingUser) {
				console.log("Email ya existe en el sistema");
				throw new Error(
					"Ya existe una cuenta registrada con este correo electrónico. Intenta iniciar sesión o usa otro correo.",
				);
			}
			console.log("Email disponible para registro");

			// 2. Crear cuenta de autenticación en Supabase Auth
			console.log("Creando cuenta en Supabase Auth...");
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: userData.email,
				password: userData.password,
				options: {
					// Redirección tras confirmar email
					emailRedirectTo: "puntofiel://auth/callback",
					// IMPORTANTE: No establecer emailRedirectTo causa auto-confirmación en dev
					// Si quieres forzar confirmación por email, asegúrate de tenerlo configurado en Supabase
					data: {
						// Metadata que se almacena en auth.users
						first_name: userData.firstName,
						last_name: userData.lastName,
						second_last_name: userData.secondLastName || null,
						phone: userData.phone,
						role: userData.role || "customer",
					},
				},
			});

			if (authError) {
				console.error("Error en signUp de Supabase:", authError);
				this.handleAuthError(authError);
			}

			if (!authData.user) {
				console.error("No se recibió objeto user de Supabase");
				throw new Error("No se pudo crear la cuenta de usuario");
			}

			console.log("Usuario creado en auth.users:", authData.user.id);
			console.log("Estado del usuario recién creado:", {
				id: authData.user.id,
				email: authData.user.email,
				email_confirmed_at: authData.user.email_confirmed_at,
				created_at: authData.user.created_at,
				hasSession: !!authData.session,
				needsEmailConfirmation: !authData.user.email_confirmed_at,
			});

			// 3. Crear perfil en la tabla profiles
			// NOTA: Creamos el perfil inmediatamente, incluso si el email no está confirmado
			// El usuario podrá usar la app solo después de confirmar su email (manejado por RLS)
			console.log("Creando perfil en tabla profiles...");
			const { data: profileData, error: profileError } = await supabase
				.from("profiles")
				.insert({
					id: authData.user.id,
					first_name: userData.firstName,
					last_name: userData.lastName,
					second_last_name: userData.secondLastName || null,
					role: userData.role || "customer",
				})
				.select()
				.single();

			if (profileError) {
				console.error("Error al crear perfil:", profileError);
				console.error("Detalles del error:", {
					code: profileError.code,
					message: profileError.message,
					details: profileError.details,
					hint: profileError.hint,
				});

				// Intentar eliminar el usuario de auth si falla la creación del perfil
				try {
					console.log("Intentando rollback: eliminando usuario de auth...");
					await supabase.auth.admin.deleteUser(authData.user.id);
					console.log("Rollback exitoso");
				} catch (rollbackError) {
					console.error("Error en rollback:", rollbackError);
					console.error(
						"⚠️ ADVERTENCIA: Usuario creado en auth pero sin perfil. ID:",
						authData.user.id,
					);
				}

				// Manejar errores específicos de la tabla profiles
				this.handleProfileError(profileError);
			}

			console.log("Perfil creado exitosamente:", profileData.id);
			console.log("Registro completado para:", userData.email);

			// Si el email necesita confirmación, cerrar la sesión automática
			if (!authData.user.email_confirmed_at) {
				console.log(
					"⚠️ Email necesita confirmación. Cerrando sesión automática...",
				);
				// Cerrar la sesión que Supabase crea automáticamente
				await supabase.auth.signOut();
				console.log(
					"Sesión cerrada. Usuario debe confirmar email antes de usar la app.",
				);
			}

			// 4. Retornar usuario mapeado
			return this.mapToUser(
				profileData,
				authData.user.email || "",
				userData.phone,
			);
		} catch (error) {
			console.error("Error en registro completo:", error);

			// Re-lanzar el error para que sea manejado por las capas superiores
			if (error instanceof Error) {
				throw error;
			} else {
				throw new Error("Error inesperado durante el registro");
			}
		}
	}

	/**
	 * Verifica si un email ya existe en el sistema.
	 * Utiliza una función RPC para verificar de forma segura.
	 */

	// Se necesita poner esta funcion en la base de datos para
	// realizar correctamente la busqueda de email ya registrado
	/*
            CREATE OR REPLACE FUNCTION check_email_exists(email_param TEXT)
            RETURNS BOOLEAN AS $$
            BEGIN
              RETURN EXISTS (
                SELECT 1 FROM auth.users 
                WHERE email = email_param
              );
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            */
	private async checkEmailExists(email: string): Promise<boolean> {
		try {
			const { data, error } = await supabase.rpc("check_email_exists", {
				email_param: email,
			});

			if (error) {
				console.error("Error en RPC check_email_exists:", error);
				return false; // fallback seguro
			}

			console.log("Resultado RPC check_email_exists:", data);
			return data === true;
		} catch (error) {
			console.error("Error ejecutando check_email_exists:", error);
			return false;
		}
	}

	/**
	 * Autentica un usuario y obtiene su perfil completo.
	 */
	async loginUser(credentials: LoginUserDTO): Promise<User> {
		console.log("Iniciando autenticación para:", credentials.email);

		// 1. Autenticar con Supabase Auth
		const { data: authData, error: authError } =
			await supabase.auth.signInWithPassword({
				email: credentials.email,
				password: credentials.password,
			});

		if (authError) {
			console.error("Error en signIn:", authError);
			this.handleAuthError(authError);
		}

		if (!authData.user) {
			console.error("No se recibió objeto user del login");
			throw new Error("No se pudo autenticar al usuario");
		}

		console.log("Usuario autenticado:", authData.user.id);

		// 2. Obtener perfil del usuario
		const { data: profileData, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", authData.user.id)
			.single();

		if (profileError) {
			console.error("Error al obtener perfil:", profileError);
			throw new Error(`Error al obtener perfil: ${profileError.message}`);
		}

		console.log("Perfil obtenido:", profileData.id);

		// 3. Obtener email y teléfono de auth
		const email = authData.user.email || "";
		const phone = authData.user.user_metadata?.phone || "";

		return this.mapToUser(profileData, email, phone);
	}

	/**
	 * Obtiene un usuario por su ID.
	 */
	async getUserById(userId: string): Promise<User | null> {
		console.log("Buscando usuario por ID:", userId);

		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.maybeSingle();

		if (error) {
			console.error("Error al buscar usuario:", error);
			throw new Error(`Error al buscar usuario: ${error.message}`);
		}

		if (!data) {
			console.log("Usuario no encontrado");
			return null;
		}

		console.log("Usuario encontrado:", data.id);

		// Nota: Para getUserById no tenemos acceso a authData,
		// por lo que email y phone quedarán vacíos a menos que consultemos auth.users
		// TODO: Considerar guardar email/phone en profiles o usar admin API
		return this.mapToUser(data, "", "");
	}

	/**
	 * Mapea datos de la BD al formato de la entidad User.
	 */
	private mapToUser(
		profileData: {
			id: string;
			first_name: string;
			last_name: string;
			second_last_name: string | null;
			role: "customer" | "employee" | "owner";
			created_at?: string;
			updated_at?: string;
		},
		email = "",
		phone = "",
	): User {
		return {
			id: profileData.id,
			email: email,
			firstName: profileData.first_name,
			lastName: profileData.last_name,
			secondLastName: profileData.second_last_name ?? undefined,
			role: profileData.role,
			phone: phone,
			createdAt: new Date(profileData.created_at || Date.now()),
			updatedAt: new Date(profileData.updated_at || Date.now()),
		};
	}

	/**
	 * Maneja errores específicos de la tabla profiles.
	 */
	private handleProfileError(error: {
		code?: string;
		message?: string;
	}): never {
		console.error("Analizando error de perfil:", error);

		// Error de clave duplicada (no debería pasar si verificamos bien el email)
		if (
			error.code === "23505" ||
			error.message?.includes("duplicate key value")
		) {
			throw new Error(
				"Ya existe un perfil para este usuario. Contacta soporte si el problema persiste.",
			);
		}

		// Error de violación de clave foránea
		if (
			error.code === "23503" ||
			error.message?.includes("foreign key violation")
		) {
			throw new Error(
				"Error de consistencia en la base de datos. Intenta nuevamente.",
			);
		}

		// Error de permisos RLS
		if (
			error.code === "42501" ||
			error.message?.includes("permission denied") ||
			error.message?.includes("RLS")
		) {
			throw new Error("Error de permisos. Contacta soporte técnico.");
		}

		// Error de validación de datos
		if (error.code === "23514" || error.message?.includes("check violation")) {
			throw new Error(
				"Los datos no cumplen con los requisitos. Verifica la información e intenta nuevamente.",
			);
		}

		// Error genérico de perfil
		throw new Error(
			"Error al crear el perfil de usuario. Intenta nuevamente o contacta soporte.",
		);
	}

	/**
	 * Maneja errores de autenticación con mensajes amigables.
	 */
	private handleAuthError(error: {
		message?: string;
		code?: string;
		status?: number;
	}): never {
		console.error("Analizando error de autenticación:", {
			message: error.message,
			code: error.code,
			status: error.status,
		});

		// Casos específicos de registro
		if (
			error.message?.includes("User already registered") ||
			error.message?.includes("Email already exists") ||
			error.message?.includes("duplicate key value violates unique constraint")
		) {
			throw new Error(
				"Ya existe una cuenta registrada con este correo electrónico. Intenta iniciar sesión o usa otro correo.",
			);
		}

		// Casos específicos de login
		if (
			error.message?.includes("Invalid login credentials") ||
			error.message?.includes("Email or password is incorrect") ||
			error.message?.includes("Invalid email or password")
		) {
			throw new Error(
				"Correo electrónico o contraseña incorrectos. Por favor, verifica tus datos e intenta nuevamente.",
			);
		}

		// Email no confirmado
		if (
			error.message?.includes("Email not confirmed") ||
			error.message?.includes("email_not_confirmed")
		) {
			throw new Error(
				"Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.",
			);
		}

		// Contraseña muy débil
		if (
			error.message?.includes("Password is too weak") ||
			error.message?.includes("weak_password")
		) {
			throw new Error(
				"La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.",
			);
		}

		// Formato de email inválido
		if (
			error.message?.includes("Invalid email format") ||
			error.message?.includes("invalid_email")
		) {
			throw new Error(
				"El formato del correo electrónico no es válido. Por favor, verifica e intenta nuevamente.",
			);
		}

		// Demasiados intentos
		if (
			error.message?.includes("too_many_requests") ||
			error.message?.includes("rate_limit")
		) {
			throw new Error(
				"Has realizado demasiados intentos. Por favor, espera unos minutos antes de volver a intentar.",
			);
		}

		// Error de conexión
		if (
			error.message?.includes("network") ||
			error.message?.includes("timeout") ||
			error.message?.includes("connection")
		) {
			throw new Error(
				"Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.",
			);
		}

		// Error genérico pero amigable
		console.error("Error no manejado específicamente:", error.message);
		throw new Error(
			"Ocurrió un error inesperado. Por favor, intenta nuevamente o contacta soporte si el problema persiste.",
		);
	}
}

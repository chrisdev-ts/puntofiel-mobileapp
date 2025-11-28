import { AuthApiError, type Session } from "@supabase/supabase-js";
import type { UpdateUserDTO } from "@/src/core/entities/UpdateUserDTO";
import type {
	CreateUserDTO,
	LoginUserDTO,
	User,
} from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

/**
 * Mapea el objeto de perfil de Supabase a la entidad de dominio User.
 * Lectura del teléfono: ÚNICAMENTE desde los metadatos de la sesión.
 */
const mapToUserEntity = (
	supabaseProfile: Record<string, unknown>,
	authSession: Session | null = null,
): User => {
	const email = authSession?.user.email || supabaseProfile.email;

	// Obtener Teléfono: SOLO desde los metadatos del usuario Auth
	const phoneFromAuthMetadata = authSession?.user?.user_metadata?.phone;

	return {
		id: String(supabaseProfile.id ?? ""),
		email: typeof email === "string" ? email : "",
		firstName:
			typeof supabaseProfile.first_name === "string"
				? supabaseProfile.first_name
				: "",
		lastName:
			typeof supabaseProfile.last_name === "string"
				? supabaseProfile.last_name
				: "",
		secondLastName:
			typeof supabaseProfile.second_last_name === "string"
				? supabaseProfile.second_last_name
				: undefined,
		phone:
			typeof phoneFromAuthMetadata === "string" ? phoneFromAuthMetadata : "",
		role:
			typeof supabaseProfile.role === "string"
				? (supabaseProfile.role as "customer" | "employee" | "owner")
				: "customer",
		createdAt: supabaseProfile.created_at
			? new Date(String(supabaseProfile.created_at))
			: new Date(),
		updatedAt: supabaseProfile.updated_at
			? new Date(String(supabaseProfile.updated_at))
			: new Date(),
	};
};

/**
 * Implementación del repositorio de usuarios que utiliza Supabase.
 */
export default class SupabaseUserRepository implements IUserRepository {
	updateProfile(
		_userId: string,
		_updatedData: Partial<
			Omit<User, "id" | "role" | "createdAt" | "updatedAt">
		>,
	): Promise<User> {
		throw new Error("Method not implemented.");
	}

	/**
	 * Implementación requerida por IUserRepository.
	 */
	async updateUser(userId: string, data: UpdateUserDTO): Promise<User> {
		// 1. Preparar la actualización de la tabla 'profiles' (nombre, apellidos)
		const updateProfilePayload: Record<string, unknown> = {};
		let needsProfileUpdate = false;

		if (data.firstName !== undefined) {
			updateProfilePayload.first_name = data.firstName;
			needsProfileUpdate = true;
		}
		if (data.lastName !== undefined) {
			updateProfilePayload.last_name = data.lastName;
			needsProfileUpdate = true;
		}
		if (data.secondLastName !== undefined) {
			updateProfilePayload.second_last_name = data.secondLastName;
			needsProfileUpdate = true;
		}

		// 2. Preparar la actualización de Auth User Metadata (teléfono)
		let updatedAuthUser = null;
		if (data.phone !== undefined) {
			const { data: userData, error: authError } =
				await supabase.auth.updateUser({
					data: { phone: data.phone },
				});

			if (authError) {
				console.error("Supabase Auth error updating user metadata:", authError);
				throw new Error(
					"Hubo un problema al actualizar el teléfono en la autenticación.",
				);
			}
			updatedAuthUser = userData.user;
		}

		// 3. Ejecutar actualización de la tabla 'profiles' si es necesario
		let updatedProfile = null;
		if (needsProfileUpdate) {
			const { data: profile, error: profileError } = await supabase
				.from("profiles")
				.update(updateProfilePayload)
				.eq("id", userId)
				.select()
				.single();

			if (profileError) {
				console.error("Supabase error updating profile:", profileError);
				throw new Error(
					"Hubo un problema al actualizar la información del perfil.",
				);
			}
			updatedProfile = profile;
		}

		// 4. Si no hubo actualizaciones, devolver el usuario actual
		if (!needsProfileUpdate && !updatedAuthUser) {
			const user = await this.getUserById(userId);
			if (!user) throw new Error("Usuario no encontrado para retornar.");
			return user;
		}

		// 5. Obtener la sesión para mapear el resultado (necesaria para el email y phone metadata)
		const {
			data: { session },
		} = await supabase.auth.getSession();

		// Si solo se actualizó Auth, necesitamos obtener el perfil para mapear.
		if (!updatedProfile) {
			updatedProfile = await this.getProfileById(userId);
			if (!updatedProfile) throw new Error("Perfil de usuario no encontrado.");
		}

		const userEntity = mapToUserEntity(updatedProfile, session);

		console.log(`[Repo] Usuario ${userId} actualizado exitosamente.`);
		return userEntity;
	}

	/**
	 * Método auxiliar para obtener el perfil de la DB (excluyendo la lógica de sesión)
	 */
	private async getProfileById(
		userId: string,
	): Promise<Record<string, unknown> | null> {
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();

		if (profileError && profileError.code !== "PGRST116") {
			console.error("Supabase error fetching profile:", profileError);
			throw new Error("Error al obtener el perfil del usuario.");
		}
		return profile;
	}

	async createUser(userData: CreateUserDTO): Promise<User> {
		// 1. Crear cuenta en Supabase Auth y guardar teléfono en metadata
		const {
			data: { user: authUser, session },
			error: authError,
		} = await supabase.auth.signUp({
			email: userData.email,
			password: userData.password,
			options: { data: { phone: userData.phone } },
		});

		if (authError) {
			if (authError instanceof AuthApiError && authError.status === 400) {
				throw new Error(
					"El email ya está registrado o el formato es inválido.",
				);
			}
			console.error("Supabase Auth error during registration:", authError);
			throw new Error("Error al registrar el usuario en la autenticación.");
		}

		if (!authUser) {
			throw new Error(
				"Registro fallido: No se pudo obtener el usuario de autenticación.",
			);
		}

		// 2. Crear perfil en tabla 'profiles' (SIN el teléfono)
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.insert({
				id: authUser.id,
				first_name: userData.firstName,
				last_name: userData.lastName,
				second_last_name: userData.secondLastName,
				role: userData.role,
			})
			.select()
			.single();

		if (profileError) {
			console.error("Supabase error creating profile:", profileError);
			throw new Error(
				"Error al crear el perfil del usuario en la base de datos.",
			);
		}

		return mapToUserEntity(profile, session);
	}

	async loginUser(credentials: LoginUserDTO): Promise<User> {
		const {
			data: { session },
			error: authError,
		} = await supabase.auth.signInWithPassword({
			email: credentials.email,
			password: credentials.password,
		});

		if (authError) {
			console.error("Supabase Auth error during login:", authError);
			throw new Error("Credenciales inválidas o email no verificado.");
		}

		if (!session) {
			throw new Error("No se pudo iniciar sesión.");
		}

		const user = await this.getUserById(session.user.id);
		if (!user) {
			throw new Error("Perfil de usuario no encontrado después del login.");
		}

		return user;
	}

	async getUserById(userId: string): Promise<User | null> {
		// 1. Obtener el perfil
		const profile = await this.getProfileById(userId);

		if (!profile) {
			return null;
		}

		// 2. Obtener la sesión para el email y los metadatos (teléfono)
		const {
			data: { session },
		} = await supabase.auth.getSession();

		// 3. Mapear
		return mapToUserEntity(profile, session);
	}
}

// Caso de uso para el inicio de sesión de un usuario.
// Orquesta la lógica de negocio y usa el contrato del repositorio.

import type { LoginUserDTO, User } from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";

/**
 * Caso de uso para el inicio de sesión de usuarios en PuntoFiel.
 *
 * Responsabilidades:
 * 1. Validar credenciales de acceso
 * 2. Coordinar la autenticación con Supabase
 * 3. Obtener el perfil completo del usuario
 */
export class LoginUserUseCase {
	constructor(private userRepository: IUserRepository) {}

	/**
	 * Ejecuta el proceso de autenticación.
	 *
	 * @param credentials - Email y contraseña del usuario
	 * @returns Usuario autenticado con perfil completo
	 * @throws Error si las credenciales son inválidas o el email no está verificado
	 */
	async execute(credentials: LoginUserDTO): Promise<User> {
		console.log("Ejecutando caso de uso: LoginUser");
		console.log("Email de acceso:", credentials.email);

		// Validaciones básicas
		this.validateCredentials(credentials);

		// Delegar autenticación al repositorio
		const user = await this.userRepository.loginUser(credentials);

		console.log("Usuario autenticado exitosamente:", user.id);
		console.log("Rol del usuario:", user.role);

		return user;
	}

	/**
	 * Valida que las credenciales cumplan requisitos básicos.
	 */
	private validateCredentials(credentials: LoginUserDTO): void {
		if (!credentials.email || !credentials.password) {
			throw new Error("Email y contraseña son requeridos");
		}

		if (!credentials.email.includes("@")) {
			throw new Error("Formato de email inválido");
		}

		console.log("Validación de credenciales pasada");
	}
}

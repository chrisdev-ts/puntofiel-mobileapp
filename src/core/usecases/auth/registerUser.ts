import type { CreateUserDTO, User } from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";

/**
 * Caso de uso para registrar un nuevo usuario en el sistema.
 * Supabase Auth maneja automáticamente la validación de emails duplicados.
 * Responsabilidades:
 * 1. Validar la lógica de negocio del registro
 * 2. Coordinar la creación del usuario en Supabase Auth
 * 3. Coordinar la creación del perfil en la tabla profiles
 */

export class RegisterUserUseCase {
	constructor(private userRepository: IUserRepository) {}
	/**
	 * Ejecuta el proceso completo de registro de usuario.
	 *
	 * @param userData - Datos del usuario a registrar
	 * @returns Usuario registrado con perfil creado
	 * @throws Error si hay problemas en la validación o creación
	 */
	async execute(userData: CreateUserDTO): Promise<User> {
		console.log("Ejecutando caso de uso: RegisterUser");
		console.log("Datos recibidos:", {
			email: userData.email,
			firstName: userData.firstName,
			lastName: userData.lastName,
			role: userData.role,
			phone: userData.phone,
		});
		// Validaciones de negocio específicas de PuntoFiel
		this.validateBusinessRules(userData);

		// Delegar la creación al repositorio
		const user = await this.userRepository.createUser(userData);

		console.log("Usuario registrado exitosamente:", user.id);
		return user;
	}

	/**
	 * Valida las reglas de negocio específicas de PuntoFiel.
	 */
	private validateBusinessRules(userData: CreateUserDTO): void {
		// Validar que el rol sea válido
		const validRoles = ["customer", "business_owner"];
		if (!validRoles.includes(userData.role)) {
			throw new Error("Rol de usuario no válido");
		}

		// Validar que el email no contenga dominios no permitidos (ejemplo)
		const blockedDomains = [
			"tempmail.com",
			"10minutemail.com",
			"disposablemail.com",
			"mailinator.com",
			"yopmail.com",
		];
		const emailDomain = userData.email.split("@")[1];
		if (blockedDomains.includes(emailDomain)) {
			throw new Error("Dominio de correo no permitido");
		}

		console.log("Validaciones de negocio pasadas");
	}
}

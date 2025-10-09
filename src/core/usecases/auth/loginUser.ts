// Caso de uso para el inicio de sesión de un usuario.
// Orquesta la lógica de negocio y usa el contrato del repositorio.

import type { User } from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";

export class LoginUserUseCase {
	constructor(private readonly userRepository: IUserRepository) {}

	async execute(email: string): Promise<User | null> {
		console.log(`Executing LoginUserUseCase for email: ${email}`);
		const user = await this.userRepository.findByEmail(email);
		// Aquí iría más lógica, como validar contraseñas, etc.
		return user;
	}
}

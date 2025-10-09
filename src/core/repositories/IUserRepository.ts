// Define el contrato (interfaz) para el repositorio de usuarios.
// La capa de infraestructura implementará este contrato.
import type { User } from "@/src/core/entities/User";

export interface IUserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	create(user: Omit<User, "id">): Promise<User>;
}

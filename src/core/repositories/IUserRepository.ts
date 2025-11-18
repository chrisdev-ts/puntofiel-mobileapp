// Define el contrato (interfaz) para el repositorio de usuarios.
// La capa de infraestructura implementará este contrato.
import type {
	CreateUserDTO,
	LoginUserDTO,
	User,
} from "@/src/core/entities/User";
import type { UpdateUserDTO } from "../entities/UpdateUserDTO";

export interface IUserRepository {
	updateUser(userId: string, data: UpdateUserDTO): unknown;
	/**
	 * Crea un nuevo usuario en el sistema.
	 * Supabase Auth valida automáticamente emails duplicados.
	 * * Proceso:
	 * 1. Crear cuenta en Supabase Auth (email, password, phone)
	 * 2. Crear perfil en tabla profiles (firstName, lastName, secondLastName, role)
	 * @param userData - Datos del usuario a crear
	 * @returns Usuario creado
	 * @throws Error si el email ya existe o hay un problema de conexión
	 */
	createUser(userData: CreateUserDTO): Promise<User>;

	/**
	 * Autentica un usuario con email y contraseña.
	 *
	 * @param credentials - Credenciales de acceso
	 * @returns Usuario autenticado con perfil completo
	 * @throws Error si las credenciales son inválidas o el email no está verificado
	 */
	loginUser(credentials: LoginUserDTO): Promise<User>;

	/**
	 * Obtiene un usuario por su ID.
	 *
	 * @param userId - UUID del usuario
	 * @returns Usuario encontrado o null si no existe
	 * @throws Error si hay problemas de conexión
	 */
	getUserById(userId: string): Promise<User | null>;

	/**
	 * Actualiza la información del perfil del usuario autenticado.
	 *
	 * @param userId - ID del usuario a actualizar.
	 * @param updatedData - Campos a actualizar.
	 * @returns El usuario con los datos actualizados.
	 */
	updateProfile(
		userId: string,
		updatedData: Partial<Omit<User, "id" | "role" | "createdAt" | "updatedAt">>,
	): Promise<User>;
}

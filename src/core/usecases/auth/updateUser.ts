import { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { UpdateUserDTO } from "@/src/core/entities/UpdateUserDTO";
import { User } from "@/src/core/entities/User";

/**
 * @fileoverview Caso de uso para actualizar el perfil de un usuario.
 * Se encarga de la lógica de negocio y la orquestación a través del IUserRepository.
 */
export class UpdateUserUseCase {
    private userRepository: IUserRepository;

    /**
     * @param userRepository Una implementación del IUserRepository (e.g., SupabaseUserRepository)
     */
    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Ejecuta la actualización del perfil.
     * @param userId ID del usuario a actualizar.
     * @param data Campos del perfil a modificar (UpdateUserDTO).
     * @returns El objeto User actualizado.
     * @throws Error si el ID de usuario es nulo o si la actualización falla en el repositorio.
     */
    async execute(userId: string, data: UpdateUserDTO): Promise<User> {
        if (!userId) {
            console.error("[UpdateUserUseCase] Intento de actualización sin userId.");
            throw new Error("El ID de usuario es obligatorio para la actualización.");
        }
        
        try {
            // Delega la actualización a la capa de infraestructura
            const updatedUser = await this.userRepository.updateUser(userId, data) as User;
            
            // Aquí podrías añadir validaciones o lógica de negocio post-actualización
            
            return updatedUser;
        } catch (error) {
            console.error("[UpdateUserUseCase] Error al actualizar perfil:", error);
            // Re-lanzar un error de negocio para ser manejado por la capa de presentación/hook
            throw new Error("Fallo al actualizar el perfil del usuario debido a un error de sistema.");
        }
    }
}
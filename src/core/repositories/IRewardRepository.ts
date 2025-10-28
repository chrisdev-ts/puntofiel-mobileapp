import type { CreateRewardDTO, Reward, UpdateRewardDTO } from '@/src/core/entities/Reward';

/**
 * Define el contrato (interfaz) para el repositorio de recompensas.
 * La capa de infraestructura implementará este contrato.
 * 
 * Regla de Clean Architecture:
 * - Esta interfaz NO debe importar nada de infrastructure o presentation.
 * - Solo debe usar tipos del core (entities y DTOs).
 */
export interface IRewardRepository {
  /**
   * Obtiene todas las recompensas activas de un negocio.
   * @param businessId - ID del negocio
   * @returns Lista de recompensas activas
   */
  getRewardsByBusiness(businessId: string): Promise<Reward[]>;

  /**
   * Obtiene una recompensa específica por su ID.
   * @param rewardId - ID de la recompensa
   * @returns La recompensa o null si no existe
   */
  getRewardById(rewardId: string): Promise<Reward | null>;

  /**
   * Crea una nueva recompensa.
   * @param dto - Datos de la recompensa a crear
   * @param imageUri - (Opcional) URI local de la imagen a subir
   * @returns La recompensa creada con su ID
   */
  createReward(dto: CreateRewardDTO, imageUri?: string): Promise<Reward>;

  /**
   * Actualiza una recompensa existente.
   * @param rewardId - ID de la recompensa a actualizar
   * @param dto - Datos parciales a actualizar
   * @param imageUri - (Opcional) URI local de la nueva imagen
   * @returns La recompensa actualizada
   */
  updateReward(
    rewardId: string,
    dto: UpdateRewardDTO,
    imageUri?: string
  ): Promise<Reward>;

  /**
   * Desactiva una recompensa (soft delete).
   * Solo el dueño del negocio puede desactivar sus recompensas.
   * @param rewardId - ID de la recompensa
   * @param businessId - ID del negocio (para validar propiedad)
   */
  deleteReward(rewardId: string, businessId: string): Promise<void>;
}
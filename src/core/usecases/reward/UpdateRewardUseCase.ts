import type { Reward, UpdateRewardDTO } from '@/src/core/entities/Reward';
import type { IRewardRepository } from '@/src/core/repositories/IRewardRepository';

/**
 * Caso de uso para actualizar una recompensa existente.
 * 
 * Validaciones de negocio:
 * - El rewardId debe ser válido
 * - Si se actualiza el nombre, debe tener al menos 3 caracteres
 * - Si se actualizan los puntos, deben ser mayores a 0
 */
export class UpdateRewardUseCase {
  constructor(private readonly rewardRepository: IRewardRepository) {}

  async execute(
    rewardId: string,
    dto: UpdateRewardDTO,
    imageUri?: string
  ): Promise<Reward> {
    // Validación: el rewardId no puede estar vacío
    if (!rewardId || rewardId.trim() === '') {
      throw new Error('El ID de la recompensa es requerido');
    }

    // Validación: si se actualiza el nombre, debe ser válido
    if (dto.name !== undefined && dto.name.trim().length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres');
    }

    // Validación: si se actualizan los puntos, deben ser positivos
    if (dto.pointsRequired !== undefined && dto.pointsRequired <= 0) {
      throw new Error('Los puntos requeridos deben ser mayores a 0');
    }

    // Delegar al repositorio
    return await this.rewardRepository.updateReward(rewardId, dto, imageUri);
  }
}
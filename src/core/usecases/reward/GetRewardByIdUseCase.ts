import type { Reward } from '@/src/core/entities/Reward';
import type { IRewardRepository } from '@/src/core/repositories/IRewardRepository';

/**
 * Caso de uso para obtener una recompensa específica por su ID.
 * 
 * Validaciones de negocio:
 * - El ID de la recompensa debe ser válido
 * - Si la recompensa no existe, retorna null
 */
export class GetRewardByIdUseCase {
  constructor(private readonly rewardRepository: IRewardRepository) {}

  async execute(rewardId: string): Promise<Reward | null> {
    // Validación: el ID no puede estar vacío
    if (!rewardId || rewardId.trim() === '') {
      throw new Error('El ID de la recompensa es requerido');
    }

    // Delegar al repositorio
    return await this.rewardRepository.getRewardById(rewardId);
  }
}
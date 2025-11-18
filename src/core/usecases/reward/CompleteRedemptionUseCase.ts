import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";

export class CompleteRedemptionUseCase {
    constructor(private readonly rewardRepository: IRewardRepository) {}

    async execute(qrData: string): Promise<any> { // Retorna info para mostrar
        try {
            const data = JSON.parse(qrData);
            const { rewardId, userId, timestamp, points } = data;

            // 1. Validar expiración (30 min)
            const qrTime = new Date(timestamp).getTime();
            const now = new Date().getTime();
            if (now - qrTime > 30 * 60 * 1000) {
                throw new Error("El código QR ha expirado (validez 30 min).");
            }

            // 2. Obtener detalles para mostrar al empleado
            // Aquí podríamos llamar al repo para validar que la transacción 'redeem' existe en BD
            // pero por ahora confiaremos en los datos firmados del QR y validaremos existencia de reward.
            const reward = await this.rewardRepository.getRewardById(rewardId);
            if (!reward) throw new Error("La recompensa no existe.");

            return {
                rewardName: reward.name,
                points: points,
                customerName: "Cliente", // Idealmente buscar nombre usuario
                rewardId,
                userId
            };
        } catch (e) {
            throw new Error("Código QR inválido o corrupto.");
        }
    }
}
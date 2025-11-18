/**
 * Entidad de dominio: Rifa Anual
 *
 * Representa una rifa anual de la plataforma PuntoFiel.
 */
export interface Raffle {
    id: string;
    businessId: string;
    name: string;
    prize: string;
    description: string;
    pointsRequired: number;
    maxTicketsPerUser: number;
    startDate: Date;
    endDate: Date;
    imageUrl?: string;
    // 👇 Agregados
    winnerCustomerId?: string | null; 
    isCompleted: boolean; 
    // 👆
    isActive: boolean;
    createdAt: Date;
    isParticipating: boolean;
}

/**
 * DTO para crear una nueva rifa anual
 */
export interface CreateRaffleDTO {
    businessId: string;
    name: string;
    prize: string;
    description: string;
    pointsRequired: number;
    maxTicketsPerUser: number;
    startDate: Date;
    endDate: Date;
}

export interface UpdateRaffleDTO {
    name?: string;
    prize?: string;
    description?: string;
    pointsRequired?: number;
    maxTicketsPerUser?: number;
    startDate?: Date;
    endDate?: Date;
}

/**
 * DTO para actualizar una rifa (cuando se sortea)
 */
export interface UpdateAnnualRaffleDTO {
	/** ID del ganador */
	winnerCustomerId?: string;

	/** Marcar como completada */
	isCompleted?: boolean;
}

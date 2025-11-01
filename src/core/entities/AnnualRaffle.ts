/**
 * Entidad de dominio: Rifa Anual
 *
 * Representa una rifa anual de la plataforma PuntoFiel.
 */
export interface AnnualRaffle {
	/** Identificador único de la rifa */
	id: number;

	/** Año de la rifa */
	raffleYear: number;

	/** Fecha de realización de la rifa */
	raffleDate: Date;

	/** ID del cliente ganador (opcional hasta que se realice el sorteo) */
	winnerCustomerId?: string;

	/** Indica si la rifa ya fue completada/sorteada */
	isCompleted: boolean;
}

/**
 * DTO para crear una nueva rifa anual
 */
export interface CreateAnnualRaffleDTO {
	/** Año de la rifa */
	raffleYear: number;

	/** Fecha de realización */
	raffleDate: Date;
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

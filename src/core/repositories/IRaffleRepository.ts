import type {
	CreateRaffleDTO,
	Raffle,
	UpdateRaffleDTO,
} from "@/src/core/entities/AnnualRaffle";

export interface RaffleParticipant {
	id: string; // ID del ticket
	customer: {
		id: string;
		firstName: string;
		lastName: string;
	};
}

/**
 * Define el contrato (interfaz) para el repositorio de rifas anuales.
 * La capa de infraestructura implementará este contrato.
 *
 * Regla de Clean Architecture:
 * - Esta interfaz NO debe importar nada de infrastructure o presentation.
 * - Solo debe usar tipos del core (entities y DTOs).
 */
export interface IRaffleRepository {
	/**
	 * Obtiene todas las rifas de un negocio (activas e inactivas, filtradas por lógica de negocio).
	 * @param businessId - ID del negocio
	 * @returns Lista de rifas
	 */
	getRafflesByBusiness(businessId: string): Promise<Raffle[]>;

	/**
	 * Obtiene una rifa específica por su ID.
	 * @param raffleId - ID de la rifa
	 * @returns La rifa o null si no existe
	 */
	getRaffleById(raffleId: string): Promise<Raffle | null>;

	/**
	 * Crea una nueva rifa anual.
	 * @param dto - Datos de la rifa a crear
	 * @param imageUri - (Opcional) URI local de la imagen a subir
	 * @returns void (o la Rifa creada si decides retornarla)
	 */
	createRaffle(dto: CreateRaffleDTO, imageUri?: string): Promise<void>;

	/**
	 * Actualiza una rifa existente.
	 * @param raffleId - ID de la rifa a actualizar
	 * @param dto - Datos parciales a actualizar
	 * @param imageUri - (Opcional) URI local de la nueva imagen
	 * @returns La rifa actualizada
	 */
	updateRaffle(
		raffleId: string,
		dto: UpdateRaffleDTO,
		imageUri?: string,
	): Promise<Raffle>;

	/**
	 * Elimina una rifa.
	 * Solo el dueño del negocio puede eliminar sus rifas.
	 * @param raffleId - ID de la rifa
	 * @param businessId - ID del negocio (para validar propiedad)
	 */
	deleteRaffle(raffleId: string, businessId: string): Promise<void>;

	/**
	 * Obtiene las rifas de TODOS los negocios donde el cliente tiene una tarjeta de lealtad.
	 */
	getRafflesForCustomer(customerId: string): Promise<Raffle[]>;

	getParticipants(raffleId: string): Promise<RaffleParticipant[]>;
	selectWinner(raffleId: string, customerId: string): Promise<void>;

	// --- TRANSACCIONES DE TICKETS (Cliente) ---

	/** Cuenta cuántos boletos tiene un usuario en una rifa. */
	getUserTicketCount(raffleId: string, userId: string): Promise<number>;

	/** Compra un boleto (Resta puntos y crea ticket). */
	buyTicket(raffleId: string, userId: string, cost: number): Promise<void>;

	/** Devuelve todos los tickets de una rifa y reembolsa los puntos. */
	returnTickets(raffleId: string, userId: string): Promise<void>;
}

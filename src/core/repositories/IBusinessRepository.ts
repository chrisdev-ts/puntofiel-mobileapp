import type {
	Business,
	CreateBusinessDTO,
	UpdateBusinessDTO,
} from "@/src/core/entities/Business";

/**
 * Contrato del repositorio de negocios.
 * Define las operaciones de persistencia para la entidad Business.
 */
export interface IBusinessRepository {
	/**
	 * Crea un nuevo negocio en el sistema.
	 *
	 * @param businessData - Datos del negocio a crear
	 * @returns Negocio creado con su ID generado
	 * @throws Error si hay problemas de conexión o validación
	 */
	createBusiness(businessData: CreateBusinessDTO): Promise<Business>;

	/**
	 * Actualiza un negocio existente.
	 *
	 * @param businessId - ID del negocio a actualizar
	 * @param updates - Campos a actualizar
	 * @returns Negocio actualizado
	 * @throws Error si el negocio no existe o hay problemas de conexión
	 */
	updateBusiness(
		businessId: string,
		updates: UpdateBusinessDTO,
	): Promise<Business>;

	/**
	 * Obtiene todos los negocios de un propietario.
	 *
	 * @param ownerId - ID del propietario
	 * @returns Lista de negocios del propietario
	 * @throws Error si hay problemas de conexión
	 */
	getBusinessesByOwner(ownerId: string): Promise<Business[]>;

	/**
	 * Sube el logo de un negocio a Supabase Storage.
	 *
	 * @param imageUri - URI local de la imagen (file://)
	 * @param businessId - ID del negocio
	 * @returns URL pública del logo subido
	 * @throws Error si la subida falla o el formato es inválido
	 */
	uploadBusinessLogo(imageUri: string, businessId: string): Promise<string>;

	/**
	 * Obtiene un negocio por su ID.
	 *
	 * @param businessId - ID del negocio
	 * @returns Negocio encontrado o null si no existe
	 * @throws Error si hay problemas de conexión
	 */
	getBusinessById(businessId: string): Promise<Business | null>;
}

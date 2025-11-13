import type { Business, CreateBusinessDTO } from "@/src/core/entities/Business";
import type { IBusinessRepository } from "@/src/core/repositories/IBusinessRepository";

/**
 * Caso de uso: Crear un nuevo negocio.
 * 
 * Encapsula la lógica de negocio para registrar un negocio,
 * incluyendo la subida de logo si se proporciona.
 */
export class CreateBusinessUseCase {
    constructor(private businessRepository: IBusinessRepository) {}

    /**
     * Ejecuta la creación del negocio.
     * 
     * @param businessData - Datos del negocio a crear
     * @param logoUri - URI local del logo (opcional)
     * @returns Negocio creado con logo subido (si aplica)
     */
    async execute(
        businessData: CreateBusinessDTO,
        logoUri?: string,
    ): Promise<Business> {
        // Validación básica
        if (!businessData.name || businessData.name.trim().length === 0) {
            throw new Error("El nombre del negocio es obligatorio");
        }

        if (!businessData.category) {
            throw new Error("La categoría del negocio es obligatoria");
        }

        // 1. Crear el negocio primero (sin logo)
        const business = await this.businessRepository.createBusiness({
            ...businessData,
            logoUrl: undefined, // Se actualizará después si hay logo
        });

        // 2. Si hay logo, subirlo y actualizar el negocio
        if (logoUri) {
            try {
                const logoUrl = await this.businessRepository.uploadBusinessLogo(
                    logoUri,
                    business.id,
                );

                // Actualizar el negocio con la URL del logo
                const updatedBusiness = await this.businessRepository.updateBusiness(
                    business.id,
                    { logoUrl },
                );

                return updatedBusiness;
            } catch (error) {
                console.error("Error al subir logo del negocio:", error);
                // Retornar el negocio sin logo si la subida falla
                // (el negocio ya fue creado)
                return business;
            }
        }

        return business;
    }
}
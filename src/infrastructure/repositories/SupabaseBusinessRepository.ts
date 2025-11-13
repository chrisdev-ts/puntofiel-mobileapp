import type {
    Business,
    CreateBusinessDTO,
    UpdateBusinessDTO,
} from "@/src/core/entities/Business";
import type { IBusinessRepository } from "@/src/core/repositories/IBusinessRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

export class SupabaseBusinessRepository implements IBusinessRepository {
    /**
     * Sube el logo de un negocio a Supabase Storage y retorna la URL pública.
     * Usa el mismo patrón que uploadRewardImage (ArrayBuffer para compatibilidad RN).
     */
    async uploadBusinessLogo(imageUri: string, businessId: string): Promise<string> {
        try {
            console.log("Subiendo logo del negocio:", imageUri);

            // Leer el archivo como blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Convertir blob a ArrayBuffer usando FileReader (compatible con RN)
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (reader.result instanceof ArrayBuffer) {
                        resolve(reader.result);
                    } else {
                        reject(new Error("Error al convertir blob a ArrayBuffer"));
                    }
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            // Nombre único para la imagen
            const fileName = `${businessId}-${Date.now()}.jpg`;
            const filePath = fileName;

            console.log("Subiendo a business-logos:", filePath);

            // Subir a Storage
            const { data, error } = await supabase.storage
                .from("business-logos")
                .upload(filePath, arrayBuffer, {
                    contentType: "image/jpeg",
                    upsert: true,
                });

            if (error) {
                console.error("Error subiendo logo:", error);
                throw new Error(`Error al subir el logo: ${error.message}`);
            }

            // Obtener URL pública
            const { data: publicUrlData } = supabase.storage
                .from("business-logos")
                .getPublicUrl(data.path);

            console.log("URL pública del logo:", publicUrlData.publicUrl);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error("Error en uploadBusinessLogo:", error);
            throw error;
        }
    }

    async createBusiness(businessData: CreateBusinessDTO): Promise<Business> {
        try {
            console.log("Creando negocio:", businessData);

            const { data, error } = await supabase
                .from("businesses")
                .insert({
                    owner_id: businessData.ownerId,
                    name: businessData.name,
                    category: businessData.category,
                    location_address: businessData.locationAddress,
                    opening_hours: businessData.openingHours,
                    logo_url: businessData.logoUrl,
                })
                .select()
                .single();

            if (error) {
                console.error("Error creando negocio:", error);
                throw new Error(`Error al crear negocio: ${error.message}`);
            }

            console.log("Negocio creado con ID:", data.id);

            return {
                id: data.id,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                ownerId: data.owner_id,
                name: data.name,
                category: data.category,
                locationAddress: data.location_address || undefined,
                openingHours: data.opening_hours || undefined,
                logoUrl: data.logo_url || undefined,
            };
        } catch (error) {
            console.error("Error en createBusiness:", error);
            throw error;
        }
    }

    async updateBusiness(
        businessId: string,
        updates: UpdateBusinessDTO,
    ): Promise<Business> {
        try {
            console.log("Actualizando negocio:", businessId);

            // Preparar actualización
            const updateData: Record<string, unknown> = {};
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.category !== undefined) updateData.category = updates.category;
            if (updates.locationAddress !== undefined) {
                updateData.location_address = updates.locationAddress;
            }
            if (updates.openingHours !== undefined) {
                updateData.opening_hours = updates.openingHours;
            }
            if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl;

            const { data, error } = await supabase
                .from("businesses")
                .update(updateData)
                .eq("id", businessId)
                .select()
                .single();

            if (error) {
                console.error("Error actualizando negocio:", error);
                throw new Error(`Error al actualizar negocio: ${error.message}`);
            }

            console.log("Negocio actualizado");

            return {
                id: data.id,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                ownerId: data.owner_id,
                name: data.name,
                category: data.category,
                locationAddress: data.location_address || undefined,
                openingHours: data.opening_hours || undefined,
                logoUrl: data.logo_url || undefined,
            };
        } catch (error) {
            console.error("Error en updateBusiness:", error);
            throw error;
        }
    }

    async getBusinessesByOwner(ownerId: string): Promise<Business[]> {
        try {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("owner_id", ownerId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error obteniendo negocios:", error);
                throw new Error(`Error al obtener negocios: ${error.message}`);
            }

            console.log("Negocios encontrados:", data?.length || 0);

            return (
                data?.map((row) => ({
                    id: row.id,
                    createdAt: new Date(row.created_at),
                    updatedAt: new Date(row.updated_at),
                    ownerId: row.owner_id,
                    name: row.name,
                    category: row.category,
                    locationAddress: row.location_address || undefined,
                    openingHours: row.opening_hours || undefined,
                    logoUrl: row.logo_url || undefined,
                })) || []
            );
        } catch (error) {
            console.error("Error en getBusinessesByOwner:", error);
            throw error;
        }
    }

    async getBusinessById(businessId: string): Promise<Business | null> {
        try {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("id", businessId)
                .single();

            if (error) {
                console.error("Error obteniendo negocio:", error);
                return null;
            }

            if (!data) return null;

            return {
                id: data.id,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
                ownerId: data.owner_id,
                name: data.name,
                category: data.category,
                locationAddress: data.location_address || undefined,
                openingHours: data.opening_hours || undefined,
                logoUrl: data.logo_url || undefined,
            };
        } catch (error) {
            console.error("Error en getBusinessById:", error);
            throw error;
        }
    }
}
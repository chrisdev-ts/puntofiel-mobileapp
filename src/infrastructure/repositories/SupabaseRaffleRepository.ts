import type {
    CreateRaffleDTO,
    Raffle,
    UpdateRaffleDTO,
} from "@/src/core/entities/AnnualRaffle";
import type { IRaffleRepository } from "@/src/core/repositories/IRaffleRepository";
import { supabase } from "@/src/infrastructure/services/supabase"; // Ajusta la ruta si es diferente

export class SupabaseRaffleRepository implements IRaffleRepository {

    /**
     * Sube una imagen a Supabase Storage y retorna la URL pública
     * Reutilizamos el bucket 'rewards' para no crear uno nuevo,
     * pero con prefijo 'raffle-' en el nombre del archivo.
     */
    private async uploadRaffleImage(imageUri: string, raffleId: string): Promise<string> {
        try {
            console.log("Subiendo imagen de rifa:", imageUri);

            // Leer el archivo como blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            // Convertir blob a ArrayBuffer (Compatible con RN/Expo)
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

            // Nombre único: raffle-{id}-{timestamp}.jpg
            const fileName = `raffle-${raffleId}-${Date.now()}.jpg`;
            const filePath = fileName;

            console.log("Subiendo a:", filePath);

            // Subir a Storage (Usamos el bucket 'rewards' que ya tienes configurado)
            const { data, error } = await supabase.storage
                .from("rewards")
                .upload(filePath, arrayBuffer, {
                    contentType: "image/jpeg",
                    upsert: true,
                });

            if (error) {
                console.error("Error subiendo imagen:", error);
                throw new Error(`Error al subir la imagen: ${error.message}`);
            }

            // Obtener URL pública
            const { data: publicUrlData } = supabase.storage
                .from("rewards")
                .getPublicUrl(data.path);

            console.log("URL pública:", publicUrlData.publicUrl);

            return publicUrlData.publicUrl;
        } catch (error) {
            console.error("Error en uploadRaffleImage:", error);
            throw error;
        }
    }

    async getRafflesByBusiness(businessId: string): Promise<Raffle[]> {
        const { data, error } = await supabase
            .from("annual_raffles")
            .select("*")
            .eq("business_id", businessId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error obteniendo rifas:", error);
            throw new Error(`Error al obtener rifas: ${error.message}`);
        }

        return (
            data?.map((row) => ({
                id: row.id.toString(), // Supabase devuelve int8 como number o string, aseguramos string
                businessId: row.business_id,
                name: row.name,
                prize: row.prize,
                description: row.description || "",
                pointsRequired: row.points_required,
                maxTicketsPerUser: row.max_tickets_per_user,
                startDate: new Date(row.start_date),
                endDate: new Date(row.end_date),
                imageUrl: row.image_url || undefined,
                winnerCustomerId: row.winner_customer_id,
                isCompleted: row.is_completed,
                // Calculamos si está activa en base a la fecha y si no ha terminado
                isActive: new Date(row.end_date) > new Date() && !row.is_completed,
                createdAt: new Date(row.created_at),
            })) || []
        );
    }

    async getRaffleById(raffleId: string): Promise<Raffle | null> {
        const { data, error } = await supabase
            .from("annual_raffles")
            .select("*")
            .eq("id", raffleId)
            .single();

        if (error) {
            console.error("Error obteniendo rifa:", error);
            return null;
        }

        if (!data) return null;

        return {
            id: data.id.toString(),
            businessId: data.business_id,
            name: data.name,
            prize: data.prize,
            description: data.description || "",
            pointsRequired: data.points_required,
            maxTicketsPerUser: data.max_tickets_per_user,
            startDate: new Date(data.start_date),
            endDate: new Date(data.end_date),
            imageUrl: data.image_url || undefined,
            winnerCustomerId: data.winner_customer_id,
            isCompleted: data.is_completed,
            isActive: new Date(data.end_date) > new Date() && !data.is_completed,
            createdAt: new Date(data.created_at),
        };
    }

    async createRaffle(dto: CreateRaffleDTO, imageUri?: string): Promise<void> {
        try {
            console.log("Creando rifa:", dto);

            // 1. Insertar datos básicos primero para obtener el ID
            const { data, error } = await supabase
                .from("annual_raffles")
                .insert({
                    business_id: dto.businessId,
                    name: dto.name,
                    prize: dto.prize,
                    description: dto.description,
                    points_required: dto.pointsRequired,
                    max_tickets_per_user: dto.maxTicketsPerUser,
                    start_date: dto.startDate.toISOString(),
                    end_date: dto.endDate.toISOString(),
                })
                .select()
                .single();

            if (error) {
                console.error("Error creando rifa:", error);
                throw new Error(`Error al crear rifa: ${error.message}`);
            }

            const raffleId = data.id.toString();
            console.log("Rifa creada con ID:", raffleId);

            // 2. Si hay imagen, subirla y actualizar el registro
            if (imageUri) {
                try {
                    console.log("Subiendo imagen...");
                    const imageUrl = await this.uploadRaffleImage(imageUri, raffleId);

                    const { error: updateError } = await supabase
                        .from("annual_raffles")
                        .update({ image_url: imageUrl })
                        .eq("id", raffleId);

                    if (updateError) {
                        console.error("Error actualizando image_url:", updateError);
                    } else {
                        console.log("Imagen vinculada correctamente");
                    }
                } catch (uploadError) {
                    console.error("Error subiendo imagen (la rifa se creó sin imagen):", uploadError);
                }
            }

        } catch (error) {
            console.error("Error en createRaffle:", error);
            throw error;
        }
    }

    async updateRaffle(
        raffleId: string,
        dto: UpdateRaffleDTO,
        imageUri?: string
    ): Promise<Raffle> {
        try {
            console.log("Actualizando rifa:", raffleId);

            // 1. Subir imagen nueva si existe y no es una URL remota
            let newImageUrl: string | undefined;
            if (imageUri && !imageUri.startsWith("http")) {
                try {
                    newImageUrl = await this.uploadRaffleImage(imageUri, raffleId);
                } catch (uploadError) {
                    console.error("Error subiendo nueva imagen:", uploadError);
                }
            }

            // 2. Preparar objeto de actualización dinámica
            const updateData: Record<string, any> = {};
            if (dto.name !== undefined) updateData.name = dto.name;
            if (dto.prize !== undefined) updateData.prize = dto.prize;
            if (dto.description !== undefined) updateData.description = dto.description;
            if (dto.pointsRequired !== undefined) updateData.points_required = dto.pointsRequired;
            if (dto.maxTicketsPerUser !== undefined) updateData.max_tickets_per_user = dto.maxTicketsPerUser;
            if (dto.startDate !== undefined) updateData.start_date = dto.startDate.toISOString();
            if (dto.endDate !== undefined) updateData.end_date = dto.endDate.toISOString();
            if (newImageUrl !== undefined) updateData.image_url = newImageUrl;

            // 3. Actualizar en BD
            const { data, error } = await supabase
                .from("annual_raffles")
                .update(updateData)
                .eq("id", raffleId)
                .select()
                .single();

            if (error) {
                console.error("Error actualizando rifa:", error);
                throw new Error(`Error al actualizar: ${error.message}`);
            }

            return {
                id: data.id.toString(),
                businessId: data.business_id,
                name: data.name,
                prize: data.prize,
                description: data.description || "",
                pointsRequired: data.points_required,
                maxTicketsPerUser: data.max_tickets_per_user,
                startDate: new Date(data.start_date),
                endDate: new Date(data.end_date),
                imageUrl: data.image_url || undefined,
                winnerCustomerId: data.winner_customer_id,
                isCompleted: data.is_completed,
                isActive: new Date(data.end_date) > new Date() && !data.is_completed,
                createdAt: new Date(data.created_at),
            };

        } catch (error) {
            console.error("Error en updateRaffle:", error);
            throw error;
        }
    }

    async deleteRaffle(raffleId: string, businessId: string): Promise<void> {
        try {
            console.log("Eliminando rifa:", raffleId);

            // Hard delete (Borrado físico)
            // Si prefieres soft delete como en rewards, cambia esto por un update is_active/is_completed
            const { error } = await supabase
                .from("annual_raffles")
                .delete()
                .eq("id", raffleId)
                .eq("business_id", businessId);

            if (error) {
                console.error("Error eliminando:", error);
                throw new Error(`Error al eliminar: ${error.message}`);
            }

            console.log("Rifa eliminada correctamente");
        } catch (error) {
            console.error("Error en deleteRaffle:", error);
            throw error;
        }
    }

    /**
     * Obtiene la lista de participantes (tickets) de una rifa.
     * Incluye la información del perfil del cliente.
     */
    async getParticipants(raffleId: string): Promise<any[]> {
        try {
            const { data, error } = await supabase
                .from('raffle_tickets')
                .select(`
                    id,
                    customer:profiles (
                        id,
                        first_name,
                        last_name
                    )
                `)
                .eq('raffle_id', raffleId);

            if (error) {
                console.error("Error obteniendo participantes:", error);
                throw new Error(`Error al obtener participantes: ${error.message}`);
            }

            // Mapeamos la respuesta de Supabase a nuestra estructura limpia
            return (data || []).map((ticket: any) => ({
                id: ticket.id.toString(),
                customer: {
                    id: ticket.customer.id,
                    firstName: ticket.customer.first_name,
                    lastName: ticket.customer.last_name || "",
                }
            }));
        } catch (error) {
            console.error("Error en getParticipants:", error);
            throw error;
        }
    }

    /**
     * Selecciona un ganador y cierra la rifa.
     */
    async selectWinner(raffleId: string, customerId: string): Promise<void> {
        try {
            console.log(`Seleccionando ganador ${customerId} para rifa ${raffleId}`);

            const { error } = await supabase
                .from('annual_raffles')
                .update({
                    winner_customer_id: customerId,
                    is_completed: true
                })
                .eq('id', raffleId);

            if (error) {
                console.error("Error guardando ganador:", error);
                throw new Error(`Error al guardar ganador: ${error.message}`);
            }
        } catch (error) {
            console.error("Error en selectWinner:", error);
            throw error;
        }
    }
}
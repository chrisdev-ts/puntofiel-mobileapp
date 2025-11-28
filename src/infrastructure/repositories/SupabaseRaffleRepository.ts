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
	private async uploadRaffleImage(
		imageUri: string,
		raffleId: string,
	): Promise<string> {
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

			// 👇 CAMBIO 1: Agregamos la carpeta 'rewards/' al inicio del nombre
			const fileName = `rewards/raffle-${raffleId}-${Date.now()}.jpg`;

			console.log("Subiendo a:", fileName);

			// 👇 CAMBIO 2: Usamos el nombre REAL del bucket 'puntofiel-assets'
			const { data, error } = await supabase.storage
				.from("puntofiel-assets")
				.upload(fileName, arrayBuffer, {
					contentType: "image/jpeg",
					upsert: true,
				});

			if (error) {
				console.error("Error subiendo imagen:", error);
				throw new Error(`Error al subir la imagen: ${error.message}`);
			}

			// 👇 CAMBIO 3: Obtener URL pública del mismo bucket
			const { data: publicUrlData } = supabase.storage
				.from("puntofiel-assets")
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
			.select("*, winner:profiles!winner_customer_id(first_name, last_name)")
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
				winnerName: row.winner
					? `${row.winner.first_name} ${row.winner.last_name || ""}`.trim()
					: undefined,
				isCompleted: row.is_completed,
				// Calculamos si está activa en base a la fecha y si no ha terminado
				isActive: new Date(row.end_date) > new Date() && !row.is_completed,
				createdAt: new Date(row.created_at),
				isParticipating: false,
			})) || []
		);
	}

	async getRaffleById(raffleId: string): Promise<Raffle | null> {
		const { data, error } = await supabase
			.from("annual_raffles")
			.select("*, winner:profiles!winner_customer_id(first_name, last_name)")
			.eq("id", raffleId)
			.single();

		if (error) {
			console.error("Error obteniendo rifa:", error);
			return null;
		}

		if (!data) return null;
		// Si la relación no trajo el perfil del ganador, hacemos una consulta adicional
		let winnerName: string | undefined = data.winner
			? `${data.winner.first_name} ${data.winner.last_name || ""}`.trim()
			: undefined;
		if (!winnerName && data.winner_customer_id) {
			try {
				const { data: profileData } = await supabase
					.from("profiles")
					.select("first_name, last_name")
					.eq("id", data.winner_customer_id)
					.single();

				if (profileData) {
					winnerName =
						`${profileData.first_name} ${profileData.last_name || ""}`.trim();
				}
			} catch (err) {
				// No bloqueamos la respuesta por este fallo; simplemente no tendremos el nombre.
				console.warn("No se pudo obtener nombre del ganador:", err);
			}
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
			winnerName,
			isCompleted: data.is_completed,
			isActive: new Date(data.end_date) > new Date() && !data.is_completed,
			createdAt: new Date(data.created_at),
			isParticipating: false,
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
					console.error(
						"Error subiendo imagen (la rifa se creó sin imagen):",
						uploadError,
					);
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
		imageUri?: string,
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
			const updateData: Record<string, unknown> = {};
			if (dto.name !== undefined) updateData.name = dto.name;
			if (dto.prize !== undefined) updateData.prize = dto.prize;
			if (dto.description !== undefined)
				updateData.description = dto.description;
			if (dto.pointsRequired !== undefined)
				updateData.points_required = dto.pointsRequired;
			if (dto.maxTicketsPerUser !== undefined)
				updateData.max_tickets_per_user = dto.maxTicketsPerUser;
			if (dto.startDate !== undefined)
				updateData.start_date = dto.startDate.toISOString();
			if (dto.endDate !== undefined)
				updateData.end_date = dto.endDate.toISOString();
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
				isParticipating: false,
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
	async getParticipants(raffleId: string): Promise<
		Array<{
			id: string;
			customer: { id: string; firstName: string; lastName: string };
		}>
	> {
		try {
			const { data, error } = await supabase
				.from("raffle_tickets")
				.select(`
                    id,
                    customer:profiles (
                        id,
                        first_name,
                        last_name
                    )
                `)
				.eq("raffle_id", raffleId);

			if (error) {
				console.error("Error obteniendo participantes:", error);
				throw new Error(`Error al obtener participantes: ${error.message}`);
			}

			// Mapeamos la respuesta de Supabase a nuestra estructura limpia
			return (data || []).map(
				(ticket: {
					id: string;
					customer:
						| { id: string; first_name: string; last_name?: string }
						| Array<{ id: string; first_name: string; last_name?: string }>;
				}) => {
					// Si customer es array, tomar el primero (Supabase puede devolver array si la relación es múltiple)
					const customerObj = Array.isArray(ticket.customer)
						? ticket.customer[0]
						: ticket.customer;
					return {
						id: ticket.id.toString(),
						customer: {
							id: customerObj.id,
							firstName: customerObj.first_name,
							lastName: customerObj.last_name || "",
						},
					};
				},
			);
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
				.from("annual_raffles")
				.update({
					winner_customer_id: customerId,
					is_completed: true,
				})
				.eq("id", raffleId);

			if (error) {
				console.error("Error guardando ganador:", error);
				throw new Error(`Error al guardar ganador: ${error.message}`);
			}
		} catch (error) {
			console.error("Error en selectWinner:", error);
			throw error;
		}
	}

	async getRafflesForCustomer(customerId: string): Promise<Raffle[]> {
		try {
			// 1. Obtener IDs de negocios vinculados (código existente)
			const { data: loyaltyCards, error: loyaltyError } = await supabase
				.from("loyalty_cards")
				.select("business_id")
				.eq("customer_id", customerId);
			if (loyaltyError) throw new Error(loyaltyError.message);
			if (!loyaltyCards || loyaltyCards.length === 0) return [];
			const businessIds = loyaltyCards.map((card) => card.business_id);

			// 2. Obtener las rifas de ESOS negocios (código existente)
			const { data: raffleRows, error } = await supabase
				.from("annual_raffles")
				.select("*, winner:profiles!winner_customer_id(first_name, last_name)")
				.in("business_id", businessIds)
				.order("end_date", { ascending: true });
			if (error) throw new Error(`Error al obtener rifas: ${error.message}`);
			if (!raffleRows || raffleRows.length === 0) return [];

			// 🔥 3. CONSULTA CONCURRENTE DE PARTICIPACIÓN
			const rafflesWithParticipationPromises = raffleRows.map(async (row) => {
				const raffleId = row.id.toString();

				// Usamos el método existente para contar tickets
				const ticketCount = await this.getUserTicketCount(raffleId, customerId);

				const isParticipating = ticketCount > 0; // Se calcula aquí.

				// Mapear a entidad Raffle
				return {
					id: raffleId,
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
					winnerName: row.winner
						? `${row.winner.first_name} ${row.winner.last_name || ""}`.trim()
						: undefined,
					isCompleted: row.is_completed,
					isActive: new Date(row.end_date) > new Date() && !row.is_completed,
					createdAt: new Date(row.created_at),
					isParticipating: isParticipating, // 🔥 Se asigna el valor calculado.
				} as Raffle;
			});

			// Esperar a que todas las verificaciones terminen
			return await Promise.all(rafflesWithParticipationPromises);
		} catch (error) {
			console.error("Error en getRafflesForCustomer:", error);
			throw error;
		}
	}

	// --- LÓGICA TRANSACCIONAL (CLIENTE) ---

	async getUserTicketCount(raffleId: string, userId: string): Promise<number> {
		const { count, error } = await supabase
			.from("raffle_tickets")
			.select("*", { count: "exact", head: true })
			.eq("raffle_id", raffleId)
			.eq("customer_id", userId);
		if (error) throw error;
		return count || 0;
	}

	async buyTicket(
		raffleId: string,
		userId: string,
		cost: number,
	): Promise<void> {
		try {
			// 1. Datos de la rifa (para saber el negocio)
			const { data: raffle } = await supabase
				.from("annual_raffles")
				.select("business_id")
				.eq("id", raffleId)
				.single();
			if (!raffle) throw new Error("Rifa no encontrada");

			// 2. Tarjeta del usuario
			const { data: card } = await supabase
				.from("loyalty_cards")
				.select("id, points")
				.eq("customer_id", userId)
				.eq("business_id", raffle.business_id)
				.single();
			if (!card) throw new Error("No tienes tarjeta en este negocio");
			if (card.points < cost) throw new Error("Puntos insuficientes");

			// 3. Restar puntos
			const { error: updateError } = await supabase
				.from("loyalty_cards")
				.update({ points: card.points - cost })
				.eq("id", card.id);
			if (updateError) throw new Error("Error al descontar puntos");

			// 4. Crear ticket (Incluyendo points_spent si agregaste la columna)
			const { error: insertError } = await supabase
				.from("raffle_tickets")
				.insert({
					raffle_id: parseInt(raffleId, 10),
					customer_id: userId,
				});

			// Rollback básico
			if (insertError) {
				await supabase
					.from("loyalty_cards")
					.update({ points: card.points })
					.eq("id", card.id);
				throw new Error("Error al generar ticket");
			}
		} catch (error: unknown) {
			console.error("Error en buyTicket:", error);
			throw error;
		}
	}

	async returnTickets(raffleId: string, userId: string): Promise<void> {
		try {
			// 1. Obtener datos rifa (necesitamos el precio actual)
			const { data: raffle } = await supabase
				.from("annual_raffles")
				.select("business_id, points_required") // Traemos points_required
				.eq("id", raffleId)
				.single();

			if (!raffle) throw new Error("Rifa no encontrada");

			// 2. Contar tickets (ya no sumamos points_spent, solo contamos filas)
			const { count, error: countError } = await supabase
				.from("raffle_tickets")
				.select("*", { count: "exact", head: true })
				.eq("raffle_id", raffleId)
				.eq("customer_id", userId);

			if (countError) throw countError;
			if (!count || count === 0)
				throw new Error("No tienes tickets para devolver.");

			// CALCULO: Cantidad de tickets * Precio actual
			const totalRefund = count * raffle.points_required;

			// 3. BORRAR TICKETS
			const { error: deleteError } = await supabase
				.from("raffle_tickets")
				.delete()
				.eq("raffle_id", raffleId)
				.eq("customer_id", userId);

			if (deleteError) throw new Error("Error al borrar tickets");

			// 4. DEVOLVER PUNTOS
			const { data: card } = await supabase
				.from("loyalty_cards")
				.select("id, points")
				.eq("customer_id", userId)
				.eq("business_id", raffle.business_id)
				.single();

			if (card) {
				await supabase
					.from("loyalty_cards")
					.update({ points: card.points + totalRefund })
					.eq("id", card.id);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);
			console.error("Error en returnTickets:", message);
			throw error;
		}
	}
}

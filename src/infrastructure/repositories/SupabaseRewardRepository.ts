import type {
	CreateRewardDTO,
	Reward,
	UpdateRewardDTO,
} from "@/src/core/entities/Reward";
import type { IRewardRepository } from "@/src/core/repositories/IRewardRepository";
import {
	BUCKET_NAME,
	deleteFile,
	extractPathFromUrl,
	getPublicUrl,
	STORAGE_PATHS,
} from "@/src/infrastructure/services/storage";
import { supabase } from "@/src/infrastructure/services/supabase";

export class SupabaseRewardRepository implements IRewardRepository {
	/**
	 * Sube una imagen a Supabase Storage y retorna la URL pública
	 */
	async uploadRewardImage(
		imageUri: string,
		rewardId: string,
		businessId: string,
	): Promise<string> {
		try {
			console.log("Subiendo imagen:", imageUri);

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
			const fileName = `${rewardId}-${Date.now()}.jpg`;
			const filePath = STORAGE_PATHS.rewards(businessId, fileName);

			console.log("Subiendo a:", filePath);

			// Subir a Storage usando utilidad centralizada
			const { data, error } = await supabase.storage
				.from(BUCKET_NAME)
				.upload(filePath, arrayBuffer, {
					contentType: "image/jpeg",
					upsert: true,
				});

			if (error) {
				console.error("Error subiendo imagen:", error);
				throw new Error(`Error al subir la imagen: ${error.message}`);
			}

			// Obtener URL pública usando utilidad centralizada
			const publicUrl = getPublicUrl(data.path);

			console.log("URL pública:", publicUrl);

			return publicUrl;
		} catch (error) {
			console.error("Error en uploadRewardImage:", error);
			throw error;
		}
	}

	/**
	 * Elimina una imagen del Storage
	 */
	async deleteRewardImage(imageUrl: string): Promise<void> {
		try {
			const filePath = extractPathFromUrl(imageUrl);
			if (!filePath) return;

			await deleteFile(filePath);
		} catch (error) {
			console.error("Error en deleteRewardImage:", error);
		}
	}

	async getRewardsByBusiness(businessId: string): Promise<Reward[]> {
		const { data, error } = await supabase
			.from("rewards")
			.select("*")
			.eq("business_id", businessId)
			.eq("is_active", true)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error obteniendo recompensas:", error);
			throw new Error(`Error al obtener recompensas: ${error.message}`);
		}

		console.log("Recompensas encontradas:", data?.length || 0);

		return (
			data?.map((row) => ({
				id: row.id,
				businessId: row.business_id,
				name: row.name,
				description: row.description || undefined,
				pointsRequired: row.points_required,
				imageUrl: row.image_url || undefined,
				isActive: row.is_active,
				createdAt: new Date(row.created_at),
				updatedAt: new Date(row.updated_at),
			})) || []
		);
	}

	async getRewardById(rewardId: string): Promise<Reward | null> {
		const { data, error } = await supabase
			.from("rewards")
			.select("*")
			.eq("id", rewardId)
			.single();

		if (error) {
			console.error("Error obteniendo recompensa:", error);
			return null;
		}

		if (!data) return null;

		return {
			id: data.id,
			businessId: data.business_id,
			name: data.name,
			description: data.description || undefined,
			pointsRequired: data.points_required,
			imageUrl: data.image_url || undefined,
			isActive: data.is_active,
			createdAt: new Date(data.created_at),
			updatedAt: new Date(data.updated_at),
		};
	}

	async createReward(dto: CreateRewardDTO, imageUri?: string): Promise<Reward> {
		try {
			console.log("Creando recompensa:", dto);

			// 1. Crear registro en BD
			const { data, error } = await supabase
				.from("rewards")
				.insert({
					business_id: dto.businessId,
					name: dto.name,
					description: dto.description,
					points_required: dto.pointsRequired,
					is_active: true,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creando recompensa:", error);
				throw new Error(`Error al crear recompensa: ${error.message}`);
			}

			const rewardId = data.id;
			console.log("Recompensa creada con ID:", rewardId);

			// 2. Si hay imagen, subirla
			let imageUrl: string | undefined;
			if (imageUri) {
				try {
					console.log("Subiendo imagen...");
					imageUrl = await this.uploadRewardImage(
						imageUri,
						rewardId,
						dto.businessId,
					);

					// Actualizar con la URL
					const { error: updateError } = await supabase
						.from("rewards")
						.update({ image_url: imageUrl })
						.eq("id", rewardId);

					if (updateError) {
						console.error("Error actualizando image_url:", updateError);
					} else {
						console.log("Imagen vinculada");
					}
				} catch (uploadError) {
					console.error("Error subiendo imagen:", uploadError);
				}
			}

			return {
				id: rewardId,
				businessId: data.business_id,
				name: data.name,
				description: data.description || undefined,
				pointsRequired: data.points_required,
				imageUrl: imageUrl,
				isActive: data.is_active,
				createdAt: new Date(data.created_at),
				updatedAt: new Date(data.updated_at),
			};
		} catch (error) {
			console.error("Error en createReward:", error);
			throw error;
		}
	}

	async updateReward(
		rewardId: string,
		dto: UpdateRewardDTO,
		imageUri?: string,
	): Promise<Reward> {
		try {
			console.log("Actualizando recompensa:", rewardId);

			// Obtener businessId de la recompensa existente
			const existingReward = await this.getRewardById(rewardId);
			if (!existingReward) {
				throw new Error("Recompensa no encontrada");
			}

			// 1. Si hay nueva imagen, subirla
			let newImageUrl: string | undefined;
			if (imageUri) {
				try {
					newImageUrl = await this.uploadRewardImage(
						imageUri,
						rewardId,
						existingReward.businessId,
					);
				} catch (uploadError) {
					console.error("Error subiendo imagen:", uploadError);
				}
			}

			// 2. Preparar actualización
			const updateData: Record<string, unknown> = {};
			if (dto.name !== undefined) updateData.name = dto.name;
			if (dto.description !== undefined)
				updateData.description = dto.description;
			if (dto.pointsRequired !== undefined)
				updateData.points_required = dto.pointsRequired;
			if (newImageUrl !== undefined) updateData.image_url = newImageUrl;

			// 3. Actualizar en BD
			const { data, error } = await supabase
				.from("rewards")
				.update(updateData)
				.eq("id", rewardId)
				.select()
				.single();

			if (error) {
				console.error("Error actualizando:", error);
				throw new Error(`Error al actualizar: ${error.message}`);
			}

			console.log("Recompensa actualizada");

			return {
				id: data.id,
				businessId: data.business_id,
				name: data.name,
				description: data.description || undefined,
				pointsRequired: data.points_required,
				imageUrl: data.image_url || undefined,
				isActive: data.is_active,
				createdAt: new Date(data.created_at),
				updatedAt: new Date(data.updated_at),
			};
		} catch (error) {
			console.error("Error en updateReward:", error);
			throw error;
		}
	}

	async deleteReward(rewardId: string, businessId: string): Promise<void> {
		try {
			console.log("Desactivando recompensa:", rewardId);

			// Soft delete
			const { error } = await supabase
				.from("rewards")
				.update({ is_active: false })
				.eq("id", rewardId)
				.eq("business_id", businessId);

			if (error) {
				console.error("Error desactivando:", error);
				throw new Error(`Error al desactivar: ${error.message}`);
			}

			console.log("Recompensa desactivada");
		} catch (error) {
			console.error("Error en deleteReward:", error);
			throw error;
		}
	}
}

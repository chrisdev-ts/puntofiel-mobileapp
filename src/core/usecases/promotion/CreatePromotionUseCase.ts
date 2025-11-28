import type { Promotion } from "@/src/core/entities/Promotion";
import { supabase } from "@/src/infrastructure/services/supabase";

interface CreatePromotionRequest {
	businessId: string;
	title: string;
	content: string;
	startDate: Date;
	endDate?: Date;
	imageUrl?: string;
}

export class CreatePromotionUseCase {
	async execute(request: CreatePromotionRequest): Promise<Promotion> {
		try {
			// Validar datos requeridos
			if (
				!request.businessId ||
				!request.title ||
				!request.content ||
				!request.startDate
			) {
				throw new Error(
					"Faltan campos requeridos: businessId, title, content, startDate",
				);
			}

			// Convertir fechas a ISO string
			const startDate =
				request.startDate instanceof Date
					? request.startDate.toISOString()
					: new Date(request.startDate).toISOString();

			const endDate = request.endDate
				? request.endDate instanceof Date
					? request.endDate.toISOString()
					: new Date(request.endDate).toISOString()
				: null;

			// Validar que endDate sea después de startDate
			if (endDate && new Date(endDate) <= new Date(startDate)) {
				throw new Error(
					"La fecha de finalización debe ser posterior a la de inicio",
				);
			}

			// Preparar objeto para insert
			const promotionData = {
				business_id: request.businessId,
				title: request.title.trim(),
				content: request.content.trim(),
				start_date: startDate,
				end_date: endDate,
				image_url: request.imageUrl || null,
				is_active: true,
			};

			console.log("[CreatePromotionUseCase] Datos a enviar:", promotionData);

			// Insertar en Supabase
			const { data, error } = await supabase
				.from("promotions")
				.insert([promotionData])
				.select("*")
				.single();

			if (error) {
				console.error("[CreatePromotionUseCase] Error Supabase:", error);
				throw new Error(`Error al crear promoción: ${error.message}`);
			}

			if (!data) {
				throw new Error("No se recibieron datos");
			}

			console.log("[CreatePromotionUseCase] ✅ Promoción creada:", data);

			return {
				id: data.id,
				businessId: data.business_id,
				title: data.title,
				content: data.content,
				startDate: data.start_date,
				endDate: data.end_date,
				imageUrl: data.image_url,
				isActive: data.is_active,
				createdAt: data.created_at,
				updatedAt: data.updated_at,
			} as Promotion;
		} catch (error) {
			console.error("[CreatePromotionUseCase] Error:", error);
			throw error;
		}
	}
}

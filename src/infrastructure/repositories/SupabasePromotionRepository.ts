import type { Promotion } from "@/src/core/entities/Promotion";
import type { IPromotionRepository } from "@/src/core/repositories/IPromotionRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

export class SupabasePromotionRepository implements IPromotionRepository {
	async getPromotionsByBusiness(businessId: string): Promise<Promotion[]> {
		const { data, error } = await supabase
			.from("promotions")
			.select("*")
			.eq("business_id", businessId)
			.order("created_at", { ascending: false });

		if (error)
			throw new Error(`Error al obtener promociones: ${error.message}`);
		return data || [];
	}

	async getPromotionById(id: string): Promise<Promotion | null> {
		const { data, error } = await supabase
			.from("promotions")
			.select("*")
			.eq("id", id)
			.single();

		if (error && error.code !== "PGRST116") {
			throw new Error(`Error al obtener promoción: ${error.message}`);
		}
		if (!data) return null;
		// Normalizar campos snake_case a camelCase
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
		};
	}

	async createPromotion(
		data: Omit<Promotion, "id" | "created_at" | "updated_at">,
	): Promise<Promotion> {
		const { data: promotion, error } = await supabase
			.from("promotions")
			.insert([data])
			.select()
			.single();

		if (error) throw new Error(`Error al crear promoción: ${error.message}`);
		return promotion;
	}

	async updatePromotion(
		id: string,
		data: Partial<Promotion>,
	): Promise<Promotion> {
		const { data: promotion, error } = await supabase
			.from("promotions")
			.update(data)
			.eq("id", id)
			.select()
			.single();

		if (error)
			throw new Error(`Error al actualizar promoción: ${error.message}`);
		return promotion;
	}

	async deletePromotion(id: string): Promise<boolean> {
		const { error } = await supabase.from("promotions").delete().eq("id", id);

		if (error) throw new Error(`Error al eliminar promoción: ${error.message}`);
		return true;
	}

	async togglePromotionStatus(
		id: string,
		isActive: boolean,
	): Promise<Promotion> {
		return this.updatePromotion(id, { isActive });
	}
}

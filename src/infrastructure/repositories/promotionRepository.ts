import { SupabasePromotionRepository } from "@/src/infrastructure/repositories/SupabasePromotionRepository";

const repo = new SupabasePromotionRepository();

export async function getPromotionById(id: string) {
	return repo.getPromotionById(id);
}

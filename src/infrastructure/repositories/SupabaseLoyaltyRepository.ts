import type { CustomerLoyaltyCard } from "@/src/core/entities/Loyalty";
import type {
	ILoyaltyRepository,
	ProcessLoyaltyResult,
} from "@/src/core/repositories/ILoyaltyRepository";
import { supabase } from "../services/supabase";

export class SupabaseLoyaltyRepository implements ILoyaltyRepository {
	async processLoyalty(
		customerId: string,
		businessId: string,
		amount: number,
	): Promise<ProcessLoyaltyResult> {
		const { data, error } = await supabase.rpc("process_loyalty", {
			p_customer_id: customerId,
			p_business_id: businessId,
			p_amount: amount,
		});

		if (error) {
			return { success: false, message: error.message };
		}

		// El RPC devuelve un array, tomamos el primer resultado.
		const result = data[0];

		return {
			success: result.success,
			message: result.message,
			newPointsBalance: result.new_points_balance,
		};
	}

	async getCardsByCustomer(customerId: string): Promise<CustomerLoyaltyCard[]> {
		// 1. Llamamos a la función de BD segura (RPC)
		const { data, error } = await supabase.rpc("get_customer_loyalty_summary", {
			p_customer_id: customerId,
		});

		// 2. Manejamos el error
		if (error) {
			console.error("Error fetching loyalty summary:", error.message);
			console.error("Detalles del error:", error);

			// Si la función no existe en la BD, retornamos un array vacío en lugar de lanzar error
			if (
				error.message.includes("does not match function result type") ||
				error.message.includes("function") ||
				error.message.includes("does not exist")
			) {
				console.warn(
					"La función get_customer_loyalty_summary no está configurada en Supabase. " +
						"Por favor, ejecuta el script SQL en tu base de datos.",
				);
				return [];
			}

			throw new Error(error.message);
		}

		// Si no hay datos, retornar array vacío
		if (!data) {
			return [];
		}

		// 3. Mapeamos la respuesta de la BBDD a nuestra entidad del 'core'
		return data.map(
			(item: {
				card_id: string;
				points: number;
				business_id: string;
				business_name: string;
				business_logo_url: string | null;
				next_reward_points: number | null;
				next_reward_name: string | null;
			}) => ({
				cardId: item.card_id,
				points: Number(item.points), // 'numeric' de PG viene como string a veces
				businessId: item.business_id,
				businessName: item.business_name,
				businessLogoUrl: item.business_logo_url,
				nextRewardPoints: item.next_reward_points
					? Number(item.next_reward_points)
					: null,
				nextRewardName: item.next_reward_name,
			}),
		);
	}
}

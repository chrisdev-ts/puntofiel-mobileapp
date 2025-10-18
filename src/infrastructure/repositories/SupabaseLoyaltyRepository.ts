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
}

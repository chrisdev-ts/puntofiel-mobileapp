import type {
	ILoyaltyRepository,
	ProcessPurchaseResult,
} from "@/src/core/repositories/ILoyaltyRepository";
import { supabase } from "../services/supabase";

export class SupabaseLoyaltyRepository implements ILoyaltyRepository {
	async processPurchase(
		customerId: string,
		businessId: string,
		purchaseAmount: number,
	): Promise<ProcessPurchaseResult> {
		const { data, error } = await supabase.rpc("process_purchase", {
			p_customer_id: customerId,
			p_business_id: businessId,
			p_purchase_amount: purchaseAmount,
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

// Hook para manejar la lógica de escaneo y el estado de la UI.
// Aquí conectarás con el use case y el repositorio.
// Manejará estados de loading, success y error.

import { useState } from "react";
import { ProcessPurchaseUseCase } from "@/src/core/usecases/loyalty/processPurchase";
import { SupabaseLoyaltyRepository } from "@/src/infrastructure/repositories/SupabaseLoyaltyRepository";

const loyaltyRepository = new SupabaseLoyaltyRepository();
const processPurchaseUseCase = new ProcessPurchaseUseCase(loyaltyRepository);

export function useScan() {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState<null | {
		message: string;
		newPointsBalance?: number;
	}>(null);
	const [error, setError] = useState<string | null>(null);

	const process = async (
		customerId: string,
		businessId: string,
		purchaseAmount: number,
	) => {
		setLoading(true);
		setSuccess(null);
		setError(null);
		try {
			const result = await processPurchaseUseCase.execute(
				customerId,
				businessId,
				purchaseAmount,
			);
			if (result.success) {
				setSuccess({
					message: result.message,
					newPointsBalance: result.newPointsBalance,
				});
			} else {
				setError(result.message);
			}
		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : "Error desconocido";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const reset = () => {
		setSuccess(null);
		setError(null);
		setLoading(false);
	};

	return { loading, success, error, process, reset };
}

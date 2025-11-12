// Hook para manejar la lógica de procesamiento de puntos de lealtad usando TanStack Query.
// Conecta la UI con el caso de uso del core siguiendo el patrón recomendado.

import { useMutation } from "@tanstack/react-query";
import type { ProcessLoyaltyResult } from "@/src/core/repositories/ILoyaltyRepository";
import { ProcessLoyaltyUseCase } from "@/src/core/usecases/loyalty/processLoyalty";
import { SupabaseLoyaltyRepository } from "@/src/infrastructure/repositories/SupabaseLoyaltyRepository";

// Instancia del repositorio y caso de uso (Dependency Injection)
const loyaltyRepository = new SupabaseLoyaltyRepository();
const processLoyaltyUseCase = new ProcessLoyaltyUseCase(loyaltyRepository);

interface ProcessLoyaltyParams {
	customerId: string;
	businessId: string;
	amount: number;
	notes?: string;
}

export function useScan() {
	// useMutation de TanStack Query maneja automáticamente loading, error y success
	const mutation = useMutation<
		ProcessLoyaltyResult,
		Error,
		ProcessLoyaltyParams
	>({
		mutationFn: async ({
			customerId,
			businessId,
			amount,
			notes,
		}: ProcessLoyaltyParams) => {
			const result = await processLoyaltyUseCase.execute(
				customerId,
				businessId,
				amount,
				notes,
			);

			if (!result.success) {
				console.error("useScan: Transaction failed -", result.message);
				throw new Error(result.message);
			}

			return result;
		},
	});

	return {
		// Estados proporcionados por TanStack Query
		loading: mutation.isPending,
		success: mutation.isSuccess ? mutation.data : null,
		error: mutation.error?.message || null,
		// Función para procesar el registro de puntos
		process: mutation.mutate,
		// Función para resetear el estado
		reset: mutation.reset,
	};
}

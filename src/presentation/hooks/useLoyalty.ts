import { useQuery } from "@tanstack/react-query";
import React from "react";
import { GetLoyaltyCardsUseCase } from "@/src/core/usecases/loyalty/getLoyaltyCardsUseCase";
import { IS_DEV_MODE, MOCK_USER_ID } from "@/src/infrastructure/config/dev";
import { SupabaseLoyaltyRepository } from "@/src/infrastructure/repositories/SupabaseLoyaltyRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

// 1. Instanciamos dependencias (Patrón de ARCHITECTURE.md)
const loyaltyRepository = new SupabaseLoyaltyRepository();
const getLoyaltyCardsUseCase = new GetLoyaltyCardsUseCase(loyaltyRepository);

export const useLoyalty = () => {
	// 2. Obtenemos el ID del usuario de la sesión de Supabase
	const [customerId, setCustomerId] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (IS_DEV_MODE) {
			// MODO DESARROLLO: Usar usuario mock
			setCustomerId(MOCK_USER_ID);
		} else {
			// PRODUCCIÓN: Obtener usuario autenticado
			supabase.auth.getSession().then(({ data: { session } }) => {
				setCustomerId(session?.user?.id ?? null);
			});
		}
	}, []);

	// 3. Definimos el useQuery
	const { data, isLoading, error, refetch } = useQuery({
		// La Query Key identifica esta 'fetch'
		queryKey: ["loyaltyCards", customerId],

		queryFn: () => {
			if (!customerId) return Promise.resolve([]); // No hacer fetch si no hay user
			return getLoyaltyCardsUseCase.execute(customerId);
		},

		// Solo habilita la query si el customerId existe
		enabled: !!customerId,
	});

	return {
		cards: data ?? [], // Devuelve array vacío por defecto
		isLoading,
		error,
		refetch,
	};
};

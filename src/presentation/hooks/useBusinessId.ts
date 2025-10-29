// Hook para obtener el ID del negocio del usuario autenticado usando TanStack Query

import { useQuery } from "@tanstack/react-query";
import { IS_DEV_MODE, MOCK_USER_ID } from "@/src/infrastructure/config/dev";
import { supabase } from "@/src/infrastructure/services/supabase";

async function fetchBusinessId(): Promise<string> {
	let userId: string;

	if (IS_DEV_MODE) {
		// MODO DESARROLLO: Usar usuario mock
		userId = MOCK_USER_ID;
	} else {
		// PRODUCCIÓN: Obtener usuario autenticado
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error("No hay usuario autenticado");
		}
		userId = user.id;
	}

	const { data, error } = await supabase
		.from("businesses")
		.select("id")
		.eq("owner_id", userId)
		.single();

	if (error) {
		console.error("Error obteniendo negocio:", error);
		throw new Error(`No se encontró el negocio del usuario: ${error.message}`);
	}

	if (!data) {
		console.error("No hay datos de negocio");
		throw new Error("No se encontró el negocio del usuario");
	}

	//console.log('Negocio encontrado:', data.id);
	return data.id;
}

export function useBusinessId() {
	return useQuery({
		queryKey: ["businessId"],
		queryFn: fetchBusinessId,
		staleTime: 1000 * 60 * 10, // 10 minutos
		retry: 1,
	});
}

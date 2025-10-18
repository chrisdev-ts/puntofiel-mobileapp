// Hook para obtener el ID del negocio del usuario autenticado usando TanStack Query

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/infrastructure/services/supabase";

async function fetchBusinessId(): Promise<string> {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		throw new Error("No hay usuario autenticado");
	}

	const { data, error } = await supabase
		.from("businesses")
		.select("id")
		.eq("owner_id", user.id)
		.single();

	if (error) {
		throw new Error("No se encontró el negocio del usuario");
	}

	if (!data) {
		throw new Error("No se encontró el negocio del usuario");
	}

	return data.id;
}

export function useBusinessId() {
	return useQuery({
		queryKey: ["businessId"],
		queryFn: fetchBusinessId,
		staleTime: 1000 * 60 * 10, // 10 minutos - el ID del negocio no cambia frecuentemente
		retry: 1,
	});
}

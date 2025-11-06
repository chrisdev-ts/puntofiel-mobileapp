//Creado para obtener nombre del negocio

import { supabase } from "@/src/infrastructure/services/supabase";
import { useQuery } from "@tanstack/react-query";

interface Business {
	id: string;
	name: string;
	owner_id: string;
}

async function fetchBusinessById(businessId: string): Promise<Business> {
	const { data, error } = await supabase
		.from("businesses")
		.select("id, name, owner_id")
		.eq("id", businessId)
		.single();

	if (error) {
		console.error("Error obteniendo negocio:", error);
		throw new Error(`Error al obtener negocio: ${error.message}`);
	}

	if (!data) {
		throw new Error("No se encontró el negocio");
	}

	return data;
}

export function useBusinessDetail(businessId: string | undefined) {
	return useQuery({
		queryKey: ["business", businessId],
		queryFn: () => {
			if (!businessId) {
				throw new Error("Business ID es requerido");
			}
			return fetchBusinessById(businessId);
		},
		enabled: !!businessId,
		staleTime: 5 * 60 * 1000, // 5 minutos
	});
}

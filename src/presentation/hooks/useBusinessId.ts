// Hook para obtener el ID del negocio del usuario autenticado usando TanStack Query

import { supabase } from "@/src/infrastructure/services/supabase";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import { useQuery } from "@tanstack/react-query";

async function fetchBusinessId(userId: string): Promise<string> {
	const { data, error } = await supabase
		.from("businesses")
		.select("id")
		.eq("owner_id", userId)
		.single();

	if (error) {
		console.error("useBusinessId: Error fetching business", {
			message: error.message,
			code: error.code,
		});
		throw new Error(`No se encontró el negocio del usuario: ${error.message}`);
	}

	if (!data) {
		throw new Error("No se encontró el negocio del usuario");
	}

	return data.id;
}

export function useBusinessId() {
	// Obtener el ID del usuario autenticado desde el store
	const user = useAuthStore((state) => state.user);
	const userId = user?.id;

	console.log('useBusinessId hook:', { userId, user });

	return useQuery({
		queryKey: ["businessId", userId],
		queryFn: () => {
			if (!userId) {
				throw new Error("No hay usuario autenticado");
			}
			return fetchBusinessId(userId);
		},
		enabled: !!userId, // Solo ejecutar si hay usuario
		staleTime: 1000 * 60 * 10, // 10 minutos
		retry: 1,
	});
}

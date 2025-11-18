import { useQuery } from "@tanstack/react-query";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { SupabaseBusinessRepository } from "@/src/infrastructure/repositories/SupabaseBusinessRepository";
import { useAuthStore } from "@/src/presentation/stores/authStore";

const businessRepository = new SupabaseBusinessRepository();

/**
 * Hook que verifica si un owner tiene negocios registrados.
 * Si es un owner sin negocios, lo redirige automáticamente al flujo de registro.
 *
 * Esta redirección solo ocurre una vez por sesión usando un flag de referencia.
 */
export function useOwnerBusinessCheck() {
	const { user, isLoading: isAuthLoading } = useAuthStore();
	const router = useRouter();
	const segments = useSegments();
	const hasRedirected = useRef(false);

	// Solo ejecutar para owners y NO en la ruta de creación de negocio
	const shouldCheck = user?.role === "owner" && segments[2] !== "create";

	// Obtener negocios del owner
	const { data: businesses, isLoading: isBusinessesLoading } = useQuery({
		queryKey: ["businesses", "owner", user?.id],
		queryFn: async () => {
			if (!user?.id) return [];
			return await businessRepository.getBusinessesByOwner(user.id);
		},
		enabled: shouldCheck && !!user?.id,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});

	useEffect(() => {
		// No ejecutar si no debe verificar
		if (!shouldCheck) return;

		// No hacer nada si ya redirigió en esta sesión
		if (hasRedirected.current) return;

		// Esperar a que termine de cargar
		if (isAuthLoading || isBusinessesLoading) return;

		// Si no tiene negocios, redirigir al flujo de registro
		if (businesses && businesses.length === 0) {
			console.log(
				"[OwnerBusinessCheck] Owner sin negocios, redirigiendo a registro",
			);
			hasRedirected.current = true;
			router.replace("/(owner)/business/create");
		}
	}, [shouldCheck, businesses, isAuthLoading, isBusinessesLoading, router]);

	return {
		hasBusinesses: businesses && businesses.length > 0,
		businessCount: businesses?.length || 0,
		isLoading: isBusinessesLoading,
	};
}

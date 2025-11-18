import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import { useOwnerBusinessCheck } from "./useOwnerbusinessCheck";
/**

/**
 * Hook que protege rutas según el estado de autenticación y el rol del usuario
 *
 * Funcionalidad:
 * - Redirige a /welcome si no está autenticado y está en rutas protegidas
 * - Redirige a la ruta correcta si está autenticado pero en ruta incorrecta para su rol
 * - Redirige a owners sin negocios al flujo de registro (una sola vez)
 * - Permite acceso a rutas públicas siempre
 *
 * @example
 * // En _layout.tsx raíz
 * function RootLayout() {
 *   useAuthGuard();
 *   return <Slot />;
 * }
 */
export function useAuthGuard() {
	const segments = useSegments();
	const router = useRouter();
	const { user, isLoading } = useAuthStore();
	// Verificar si el owner tiene negocios registrados
	useOwnerBusinessCheck();

	useEffect(() => {
		if (isLoading) return; // No hacer nada mientras se carga la sesión

		const inAuthGroup = segments[0] === "(public)";
		const inCustomerGroup = segments[0] === "(customer)";
		const inOwnerGroup = segments[0] === "(owner)";
		const inEmployeeGroup = segments[0] === "(employee)";

		console.log("[AuthGuard] Segmentos:", segments);
		console.log("[AuthGuard] Usuario:", user?.id, "Rol:", user?.role);

		// Usuario no autenticado
		if (!user) {
			// Si está intentando acceder a rutas protegidas, redirigir a welcome
			if (!inAuthGroup) {
				console.log(
					"[AuthGuard] Usuario no autenticado, redirigiendo a /welcome",
				);
				router.replace("/(public)/welcome");
			}
			return;
		}

		// Usuario autenticado
		// Si está en rutas públicas (login/register), redirigir a su dashboard
		if (inAuthGroup) {
			console.log(
				"[AuthGuard] Usuario autenticado en ruta pública, redirigiendo a dashboard",
			);
			switch (user.role) {
				case "customer":
					router.replace("/(customer)/(tabs)/home");
					break;
				case "owner":
					router.replace("/(owner)/(tabs)/home");
					break;
				case "employee":
					router.replace("/(employee)/(tabs)/scan-qr");
					break;
			}
			return;
		} // Verificar que el usuario esté en el grupo correcto según su rol
		const isInCorrectGroup =
			(user.role === "customer" && inCustomerGroup) ||
			(user.role === "owner" && inOwnerGroup) ||
			(user.role === "employee" && inEmployeeGroup);

		if (!isInCorrectGroup) {
			console.log(
				"[AuthGuard] Usuario en grupo incorrecto, redirigiendo a dashboard",
			);
			switch (user.role) {
				case "customer":
					router.replace("/(customer)/(tabs)/home");
					break;
				case "owner":
					router.replace("/(owner)/(tabs)/home");
					break;
				case "employee":
					router.replace("/(employee)/(tabs)/scan-qr");
					break;
			}
		}
	}, [user, isLoading, segments, router]);
}

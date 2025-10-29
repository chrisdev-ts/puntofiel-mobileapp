import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FeedbackScreen } from "@/src/presentation/components/common/FeedbackScreen";
import { useAuth } from "@/src/presentation/hooks/useAuth";

/**
 * Página de inicio que redirige al usuario según su estado de autenticación y rol
 * - No autenticado → /(public)/welcome
 * - Cliente → /(customer)/(tabs)/home
 * - Propietario → /(owner)/(tabs)/home
 * - Empleado → /(employee)/(tabs)/scan
 */
export default function Index() {
	const { user, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		if (!user) {
			// No está autenticado, ir a welcome
			router.replace("/(public)/welcome");
		} else {
			// Redirigir según rol
			if (user.role === "customer") {
				router.replace("/(customer)/(tabs)/home");
			} else if (user.role === "owner") {
				router.replace("/(owner)/(tabs)/home");
			} else if (user.role === "employee") {
				router.replace("/(employee)/(tabs)/scan");
			}
		}
	}, [user, isLoading, router]);

	// Mostrar loading mientras se verifica autenticación
	if (isLoading) {
		return <FeedbackScreen variant="loading" title="Cargando..." />;
	}

	// Prevenir flash de contenido mientras redirige
	return null;
}

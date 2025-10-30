import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
	const [isMounted, setIsMounted] = useState(false);

	// Esperar a que el componente esté montado antes de navegar
	useEffect(() => {
		setIsMounted(true);
	}, []);

	useEffect(() => {
		// No navegar hasta que el componente esté montado y no esté cargando
		if (!isMounted || isLoading) return;

		// Usar setTimeout para asegurar que la navegación ocurra después del render
		const timer = setTimeout(() => {
			if (!user) {
				// No está autenticado, ir a welcome
				router.replace("/(public)/welcome");
			} else {
				// Redirigir según rol (cuando se implemente la autenticación real)
				// Por ahora, redirigir a welcome ya que user siempre será null
				router.replace("/(public)/welcome");

				// TODO: Descomentar cuando se implemente el estado de usuario real
				// if (user.role === "customer") {
				// 	router.replace("/(customer)/(tabs)/home");
				// } else if (user.role === "owner") {
				// 	router.replace("/(owner)/(tabs)/home");
				// } else if (user.role === "employee") {
				// 	router.replace("/(employee)/(tabs)/scan");
				// }
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [user, isLoading, router, isMounted]);

	// Mostrar loading mientras se verifica autenticación o no está montado
	if (isLoading || !isMounted) {
		return <FeedbackScreen variant="loading" title="Cargando..." />;
	}

	// Prevenir flash de contenido mientras redirige
	return <FeedbackScreen variant="loading" title="Iniciando..." />;
}

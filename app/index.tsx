import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AuthLoading } from "@/src/presentation/components/auth";
import { useAuth } from "@/src/presentation/hooks/useAuth";

/**
 * Página de inicio que redirige al usuario según su estado de autenticación y rol
 * - No autenticado → /(public)/welcome
 * - Cliente → /(customer)/(tabs)/home
 * - Propietario → /(owner)/(tabs)/home
 * - Empleado → /(employee)/(tabs)/scan-qr
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
				// Redirigir según el rol del usuario
				if (user.role === "customer") {
					router.replace("/(customer)/(tabs)/home");
				} else if (user.role === "owner") {
					router.replace("/(owner)/(tabs)/home");
				} else if (user.role === "employee") {
					router.replace("/(employee)/(tabs)/scan-qr");
				} else {
					// Rol desconocido, ir a welcome
					router.replace("/(public)/welcome");
				}
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [user, isLoading, router, isMounted]);

	// Mostrar loading mientras se verifica autenticación o no está montado
	if (isLoading || !isMounted) {
		return <AuthLoading message="Verificando sesión..." />;
	}

	// Prevenir flash de contenido mientras redirige
	return <AuthLoading message="Iniciando..." />;
}

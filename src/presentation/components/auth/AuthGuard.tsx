import type { ReactNode } from "react";
import { FeedbackScreen } from "@/src/presentation/components/common/FeedbackScreen";
import { useAuth } from "@/src/presentation/hooks/useAuth";

interface AuthGuardProps {
	children: ReactNode;
	requireAuth?: boolean;
	allowedRoles?: Array<"customer" | "owner" | "employee">;
}

/**
 * Componente wrapper para rutas protegidas
 *
 * Nota: La lógica de autenticación y redirección será implementada posteriormente.
 * Por ahora solo muestra un loading mientras se carga el usuario.
 */
export function AuthGuard({ children }: AuthGuardProps) {
	const { isLoading } = useAuth();

	// Mostrar loading mientras se verifica autenticación
	if (isLoading) {
		return <FeedbackScreen variant="loading" title="Cargando..." />;
	}

	return <>{children}</>;
}

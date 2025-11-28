// Utilidad para validar/castear rutas compatibles con Expo Router
function getValidRoute(path: string): string {
	// Si la ruta empieza por /, se considera válida
	if (path.startsWith("/")) return path;
	// Si no, prepende / para asegurar formato
	return `/${path}`;
}

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { usePathname, useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";

interface FeedbackScreenProps {
	/** Tipo de estado a mostrar */
	variant: "loading" | "empty" | "error";
	/** Icono de lucide-react-native (requerido para 'empty' y 'error') */
	icon?: LucideIcon;
	/** Tamaño del icono (por defecto 60) */
	iconSize?: number;
	/** Color del icono (por defecto automático según variant) */
	iconColor?: string;
	/** Título principal */
	title: string;
	/** Descripción o mensaje (string simple) */
	description?: string;
	/** Contenido adicional opcional (botones, links, etc). Si no se provee en variant="error", se muestran botones por defecto */
	action?: ReactNode;
	/** Color del spinner (por defecto "#2F4858") */
	spinnerColor?: string;
	/** Función para reintentar (solo en variant="error"). Por defecto recarga la ruta actual */
	onRetry?: () => void;
	/** Función para volver (solo en variant="error"). Por defecto usa router.back() */
	onBack?: () => void;
}

/**
 * Componente genérico para mostrar estados de carga, vacío o error
 *
 * @example
 * // Estado de carga
 * <FeedbackScreen
 *   variant="loading"
 *   title="Cargando recompensas..."
 * />
 *
 * @example
 * // Estado vacío con icono y mensaje
 * <FeedbackScreen
 *   variant="empty"
 *   icon={QrCodeIcon}
 *   title="¡Aún no tienes negocios!"
 *   description="Escanea tu primer QR para empezar"
 * />
 *
 * @example
 * // Estado de error con botones por defecto (Reintentar recarga la página, Volver regresa)
 * <FeedbackScreen
 *   variant="error"
 *   icon={AlertCircleIcon}
 *   title="No se pudo cargar"
 *   description="Ocurrió un error al cargar los datos"
 * />
 *
 * @example
 * // Estado de error con acción personalizada de reintentar
 * <FeedbackScreen
 *   variant="error"
 *   icon={AlertCircleIcon}
 *   title="No se pudo cargar"
 *   description="Ocurrió un error al cargar los datos"
 *   onRetry={() => refetch()}
 * />
 *
 * @example
 * // Estado de error con acción completamente personalizada
 * <FeedbackScreen
 *   variant="error"
 *   icon={AlertCircleIcon}
 *   title="No se pudo cargar"
 *   description="Ocurrió un error al cargar los datos"
 *   action={<Button onPress={customAction}>Acción personalizada</Button>}
 * />
 */
export function FeedbackScreen({
	variant,
	icon: Icon,
	iconSize = 60,
	iconColor,
	title,
	description,
	action,
	spinnerColor = "#2F4858",
	onRetry,
	onBack,
}: FeedbackScreenProps) {
	const router = useRouter();
	const pathname = usePathname();

	// Colores automáticos según variante
	const defaultIconColor =
		variant === "error" ? "text-error-400" : "text-gray-400";
	const titleColor =
		variant === "error"
			? "text-error-600"
			: variant === "loading"
				? "text-typography-500"
				: "text-gray-800";
	const descriptionColor =
		variant === "error"
			? "text-error-500"
			: variant === "loading"
				? "text-typography-400"
				: "text-gray-600";

	// Estado de carga
	if (variant === "loading") {
		return (
			<Box className="flex-1 justify-center items-center bg-background-0">
				<Spinner size="large" color={spinnerColor} />
				<Text className={`${titleColor} mt-4`}>{title}</Text>
				{description && (
					<Text className={`${descriptionColor} mt-2 text-center px-6`}>
						{description}
					</Text>
				)}
			</Box>
		);
	}

	// Estados vacío y error
	return (
		<VStack className="flex-1 justify-center items-center p-8" space="lg">
			{/* Icono */}
			{Icon && (
				<Box className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center">
					<Icon size={iconSize} className={iconColor || defaultIconColor} />
				</Box>
			)}

			{/* Título */}
			<Heading className={`${titleColor} text-center`}>{title}</Heading>

			{/* Descripción */}
			{description && (
				<Text className={`text-base ${descriptionColor} text-center`}>
					{description}
				</Text>
			)}

			{/* Acción opcional o botones por defecto para errores */}
			{action ? (
				<Box className="mt-2">{action}</Box>
			) : (
				variant === "error" && (
					<VStack space="md" className="mt-4 w-full max-w-xs">
						<Button
							onPress={
								onRetry ||
								(() => {
									// Recargar la ruta actual para reintentar
									router.replace(
										getValidRoute(
											pathname,
										) as import("expo-router").RelativePathString,
									);
								})
							}
							action="primary"
							size="lg"
						>
							<ButtonText>Reintentar</ButtonText>
						</Button>
						<Button
							onPress={onBack || (() => router.back())}
							variant="outline"
							size="lg"
						>
							<ButtonText>Volver</ButtonText>
						</Button>
					</VStack>
				)
			)}
		</VStack>
	);
}

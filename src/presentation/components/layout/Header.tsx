import { useRouter } from "expo-router";
import { ArrowLeftIcon, BellIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";

interface HeaderProps {
	/** Título que aparece al lado del botón de back */
	title?: string;
	/** Modo del header: 'default' muestra logo, 'back' muestra botón de volver */
	variant?: "default" | "back";
	/** Elemento personalizado derecho (solo en modo 'default'). Si no se proporciona, se muestra el icono de notificaciones por defecto */
	rightElement?: ReactNode;
	/** Función personalizada para el botón de back */
	onBackPress?: () => void;
}

/**
 * Componente de encabezado superior de la aplicación
 *
 * @example
 * // Estado predeterminado con logo y botón de notificaciones (por defecto)
 * <Header variant="default" />
 *
 * @example
 * // Estado predeterminado con elemento personalizado a la derecha
 * <Header
 *   variant="default"
 *   rightElement={<CustomButton />}
 * />
 *
 * @example
 * // Estado de navegación con botón de volver
 * <Header
 *   variant="back"
 *   title="Detalle de recompensa"
 * />
 */
export function Header({
	title,
	variant = "default",
	rightElement,
	onBackPress,
}: HeaderProps) {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const handleBackPress = () => {
		console.log("Back button pressed!");
		if (onBackPress) {
			onBackPress();
		} else {
			router.back();
		}
	};

	const handleNotificationsPress = () => {
		// TODO: Navegar a la pantalla de notificaciones cuando exista
		console.log("Abrir notificaciones");
	};

	return (
		<Box
			className="w-full border-b border-gray-400 bg-white flex-row items-center px-4"
			style={{
				position: "absolute" as const,
				top: 0,
				left: 0,
				width: "100%",
				paddingTop: insets.top,
				height: 50 + insets.top,
				zIndex: 1000,
			}}
		>
			{/* MODO DEFAULT: Logo a la izquierda */}
			{variant === "default" && (
				<>
					<Box className="flex-1 justify-center">
						<Image
							source={require("@/assets/logos/logo-horizontal-dark.png")}
							alt="PuntoFiel"
							className="h-12"
							resizeMode="contain"
						/>
					</Box>
					{/* Elemento derecho: Si se pasa rightElement, se usa; sino, se muestra el botón de notificaciones por defecto */}
					<Box className="justify-center">
						{rightElement || (
							<Pressable onPress={handleNotificationsPress}>
								<Icon as={BellIcon} size="xl" className="text-primary-500" />
							</Pressable>
						)}
					</Box>
				</>
			)}

			{/* MODO BACK: Botón de volver + Título */}
			{variant === "back" && (
				<Box className="flex-1 flex-row items-center">
					<Pressable
						onPress={handleBackPress}
						className="mr-3"
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Icon as={ArrowLeftIcon} size="xl" className="text-primary-500" />
					</Pressable>
					{title && (
						<Heading size="lg" className="text-primary-500">
							{title}
						</Heading>
					)}
				</Box>
			)}
		</Box>
	);
}

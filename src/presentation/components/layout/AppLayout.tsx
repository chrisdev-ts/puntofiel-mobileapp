import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { Header } from "./Header";
import { NavBar } from "./NavBar";

interface AppLayoutProps {
	children: ReactNode;
	showHeader?: boolean;
	showNavBar?: boolean;
	/** Título del header (solo en variant="back") */
	headerTitle?: string;
	/** Variante del header: 'default' o 'back' */
	headerVariant?: "default" | "back";
	/** Elemento derecho del header (solo en variant="default") */
	headerRightElement?: ReactNode;
	/** Función personalizada para el botón de back */
	onBackPress?: () => void;
	scrollable?: boolean;
	backgroundColor?: string;
	/** Espaciado vertical entre elementos (por defecto 'lg') */
	contentSpacing?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

/**
 * Layout estándar para las pantallas de la aplicación
 *
 * Características:
 * - Padding de 16px (p-4) estandarizado
 * - Espaciado vertical entre elementos (space="lg" por defecto)
 * - Header y NavBar opcionales
 * - Scrollable o fijo según necesidad
 * - Gestión automática de padding para header y navbar
 *
 * @example
 * // Header con logo y notificaciones
 * <AppLayout
 *   headerVariant="default"
 *   headerRightElement={<BellIcon />}
 * >
 *   {children} // Los children se envuelven automáticamente en VStack con space="lg"
 * </AppLayout>
 *
 * @example
 * // Header con botón de volver y espaciado personalizado
 * <AppLayout
 *   headerVariant="back"
 *   headerTitle="Detalle de recompensa"
 *   contentSpacing="md"
 * >
 *   {children}
 * </AppLayout>
 */
export function AppLayout({
	children,
	showHeader = true,
	showNavBar = true,
	headerTitle,
	headerVariant = "default",
	headerRightElement,
	onBackPress,
	scrollable = true,
	backgroundColor = "bg-gray-50",
	contentSpacing = "lg",
}: AppLayoutProps) {
	const insets = useSafeAreaInsets();

	// Calculamos el padding dinámicamente considerando el safe area
	const headerHeight = showHeader ? 50 + insets.top : 0;
	const navBarHeight = showNavBar ? 105 : 0;

	return (
		<Box className={`flex-1 ${backgroundColor}`}>
			{/* Header Superior (Opcional) */}
			{showHeader && (
				<Header
					variant={headerVariant}
					title={headerTitle}
					rightElement={headerRightElement}
					onBackPress={onBackPress}
				/>
			)}

			{/* Contenido Principal */}
			{scrollable ? (
				<ScrollView
					className="flex-1"
					contentContainerStyle={{
						flexGrow: 1,
						paddingTop: headerHeight,
						paddingBottom: navBarHeight,
					}}
					showsVerticalScrollIndicator={false}
				>
					<Box className="p-4">
						<VStack space={contentSpacing}>{children}</VStack>
					</Box>
				</ScrollView>
			) : (
				<Box
					className="flex-1 p-4"
					style={{
						paddingTop: headerHeight,
						paddingBottom: navBarHeight,
					}}
				>
					<VStack space={contentSpacing}>{children}</VStack>
				</Box>
			)}

			{/* Barra de navegación inferior (Opcional) */}
			{showNavBar && <NavBar />}
		</Box>
	);
}

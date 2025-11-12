import type { ReactNode } from "react";
import { View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface ListContainerProps {
	/** Array de elementos a renderizar */
	children: ReactNode;
	/** Mostrar mensaje al final de la lista */
	showFooterMessage?: boolean;
	/** Mensaje personalizado para el footer (opcional) */
	footerContent?: ReactNode;
	/** Variante de layout: list (default) o grid */
	variant?: "list" | "grid";
}

/**
 * Componente genérico de contenedor de lista
 *
 * Muestra una lista de elementos en un contenedor con borde
 * Opcionalmente puede mostrar contenido al final de la lista
 *
 * Soporta dos variantes:
 * - list: Elementos apilados verticalmente (default)
 * - grid: Grid de 2 columnas, ideal para cards verticales
 *
 * @example
 * // Lista vertical (default)
 * <ListContainer showFooterMessage={true}>
 *   {items.map(item => <ListItem key={item.id} {...item} />)}
 * </ListContainer>
 *
 * @example
 * // Grid de 2 columnas
 * <ListContainer variant="grid">
 *   {rewards.map(reward => (
 *     <ListItem
 *       key={reward.id}
 *       variant="vertical"
 *       {...reward}
 *     />
 *   ))}
 * </ListContainer>
 */
export function ListContainer({
	children,
	showFooterMessage = false,
	footerContent,
	variant = "list",
}: ListContainerProps) {
	// Grid layout (2 columnas)
	if (variant === "grid") {
		return (
			<Box className="p-1 border border-background-300 rounded-xl">
				<View className="flex-row flex-wrap">
					{/* Wrapper para cada item con width 50% y padding */}
					{/* biome-ignore lint/suspicious/noArrayIndexKey: Los children ya tienen keys únicas */}
					{Array.isArray(children) ? (
						children.map((child, index) => (
							<View key={index} className="w-1/2 p-1.5">
								{child}
							</View>
						))
					) : (
						<View className="w-1/2 p-1.5">{children}</View>
					)}
				</View>

				{/* Contenido adicional al final */}
				{showFooterMessage && (
					<Box className="p-4">
						{footerContent || (
							<Text className="text-center text-typography-400">
								¿Tienes más elementos que agregar?{"\n"}
								Toca el botón para crear uno nuevo.
							</Text>
						)}
					</Box>
				)}
			</Box>
		);
	}

	// List layout (vertical stack) - default
	return (
		<Box className="p-2 border border-background-300 rounded-xl">
			<VStack space="md">
				{children}

				{/* Contenido adicional al final */}
				{showFooterMessage && (
					<Box className="p-4">
						{footerContent || (
							<Text className="text-center text-typography-400">
								¿Tienes más elementos que agregar?{"\n"}
								Toca el botón para crear uno nuevo.
							</Text>
						)}
					</Box>
				)}
			</VStack>
		</Box>
	);
}

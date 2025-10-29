import type { ReactNode } from "react";
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
}

/**
 * Componente genérico de contenedor de lista
 *
 * Muestra una lista de elementos en un contenedor con borde
 * Opcionalmente puede mostrar contenido al final de la lista
 *
 * @example
 * <ListContainer showFooterMessage={true}>
 *   {items.map(item => <ListItem key={item.id} {...item} />)}
 * </ListContainer>
 *
 * @example
 * <ListContainer
 *   showFooterMessage={true}
 *   footerContent={<CustomFooter />}
 * >
 *   {children}
 * </ListContainer>
 */
export function ListContainer({
	children,
	showFooterMessage = false,
	footerContent,
}: ListContainerProps) {
	return (
		<Box className="p-3 border border-background-300 rounded-xl">
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

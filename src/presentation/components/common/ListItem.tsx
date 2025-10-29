import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ArrowRightIcon, Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface ListItemProps {
	/** ID único del elemento */
	id: string;
	/** URL de la imagen a mostrar */
	imageUrl?: string;
	/** Texto alternativo para la imagen */
	imageAlt: string;
	/** Título principal del item */
	title: string;
	/** Contenido del badge (opcional) */
	badge?: ReactNode;
	/** Función que se ejecuta al presionar el item */
	onPress: (id: string) => void;
}

/**
 * Componente genérico de item de lista
 *
 * Muestra una tarjeta con:
 * - Imagen cuadrada a la izquierda (o placeholder si no hay)
 * - Título principal
 * - Badge opcional debajo del título
 * - Flecha indicadora a la derecha
 *
 * @example
 * <ListItem
 *   id="123"
 *   imageUrl="https://example.com/image.jpg"
 *   imageAlt="Producto"
 *   title="Café gratis"
 *   badge={<Text>100 puntos</Text>}
 *   onPress={(id) => router.push(`/item/${id}`)}
 * />
 */
export function ListItem({
	id,
	imageUrl,
	imageAlt,
	title,
	badge,
	onPress,
}: ListItemProps) {
	return (
		<Pressable onPress={() => onPress(id)}>
			<HStack
				className="bg-background-0 border border-background-300 rounded-lg p-3 items-center"
				space="md"
			>
				{/* Imagen del item */}
				<Box className="w-20 h-20 bg-background-100 rounded-lg overflow-hidden">
					{imageUrl ? (
						<Image
							source={{ uri: imageUrl }}
							alt={imageAlt}
							className="w-full h-full"
						/>
					) : (
						<Box className="w-full h-full justify-center items-center">
							<Text size="xs" className="text-typography-400">
								Sin imagen
							</Text>
						</Box>
					)}
				</Box>

				{/* Información */}
				<VStack className="flex-1" space="xs">
					<Text bold className="text-primary-500">
						{title}
					</Text>
					{badge && badge}
				</VStack>

				{/* Flecha */}
				<Icon as={ArrowRightIcon} className="text-primary-500" size="xl" />
			</HStack>
		</Pressable>
	);
}

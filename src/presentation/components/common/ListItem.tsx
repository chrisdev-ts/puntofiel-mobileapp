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
	/** Acción personalizada debajo del contenido (opcional) */
	customAction?: ReactNode;
	/** Badge personalizado (ej: estado de rifa) */
	customBadge?: ReactNode;
	/** Función que se ejecuta al presionar el item */
	onPress?: (id: string) => void;
	/** Variante de layout: horizontal (default) o vertical (card) */
	variant?: "horizontal" | "vertical";
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
 * Soporta dos variantes:
 * - horizontal: Layout horizontal con imagen a la izquierda (default)
 * - vertical: Card vertical con imagen arriba, ideal para grids
 *
 * @example
 * // Horizontal (default)
 * <ListItem
 *   id="123"
 *   imageUrl="https://example.com/image.jpg"
 *   imageAlt="Producto"
 *   title="Café gratis"
 *   badge={<Badge>100 puntos</Badge>}
 *   onPress={(id) => router.push(`/item/${id}`)}
 * />
 *
 * @example
 * // Vertical card
 * <ListItem
 *   variant="vertical"
 *   id="123"
 *   imageUrl="https://example.com/image.jpg"
 *   imageAlt="Recompensa"
 *   title="Café gratis"
 *   badge={<Badge>350 puntos</Badge>}
 *   customAction={<Button>Canjear</Button>}
 *   onPress={(id) => router.push(`/reward/${id}`)}
 * />
 */
export function ListItem({
	id,
	imageUrl,
	imageAlt,
	title,
	badge,
	customAction,
	customBadge,
	onPress,
	variant = "horizontal",
}: ListItemProps) {
	// Layout vertical (card)
	if (variant === "vertical") {
		return (
			<VStack
				className="bg-background-0 border border-background-300 rounded-lg overflow-hidden flex-1"
				space="sm"
			>
				{/* Imagen cuadrada arriba - clickeable si hay onPress */}
				{onPress ? (
					<Pressable onPress={() => onPress(id)}>
						<Box className="w-full aspect-square bg-background-100">
							{imageUrl ? (
								<Image
									source={{ uri: imageUrl }}
									alt={imageAlt}
									className="w-full h-full"
								/>
							) : (
								<Box className="w-full h-full justify-center items-center">
									<Text size="sm" className="text-typography-400">
										Sin imagen
									</Text>
								</Box>
							)}
							{/* Badge personalizado (ej: estado de rifa) */}
							{customBadge && (
								<Box className="absolute top-2 right-2 z-10">{customBadge}</Box>
							)}
						</Box>
					</Pressable>
				) : (
					<Box className="w-full aspect-square bg-background-100">
						{imageUrl ? (
							<Image
								source={{ uri: imageUrl }}
								alt={imageAlt}
								className="w-full h-full"
							/>
						) : (
							<Box className="w-full h-full justify-center items-center">
								<Text size="sm" className="text-typography-400">
									Sin imagen
								</Text>
							</Box>
						)}
						{/* Badge personalizado (ej: estado de rifa) */}
						{customBadge && (
							<Box className="absolute top-2 right-2 z-10">{customBadge}</Box>
						)}
					</Box>
				)}

				{/* Contenido */}
				<VStack className="p-3 flex-1" space="sm">
					{onPress ? (
						<Pressable onPress={() => onPress(id)}>
							<Text bold className="text-typography-900">
								{title}
							</Text>
						</Pressable>
					) : (
						<Text bold className="text-typography-900">
							{title}
						</Text>
					)}
					{badge && <Box>{badge}</Box>}
					{customAction && <Box className="mt-auto">{customAction}</Box>}
				</VStack>
			</VStack>
		);
	}
	// Si hay customAction, usar layout vertical
	if (customAction) {
		return (
			<VStack
				className="bg-background-0 border border-background-300 rounded-lg p-3"
				space="md"
			>
				{/* Contenido superior con imagen y texto - clickeable si hay onPress */}
				{onPress ? (
					<Pressable onPress={() => onPress(id)}>
						<HStack space="md" className="items-center">
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
						</HStack>
					</Pressable>
				) : (
					<HStack space="md" className="items-center">
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
					</HStack>
				)}

				{/* Acción personalizada debajo - independiente del Pressable */}
				<Box className="w-full">{customAction}</Box>
			</VStack>
		);
	}

	// Layout horizontal por defecto (sin customAction)
	const content = (
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

			{/* Flecha por defecto */}
			<Icon as={ArrowRightIcon} className="text-primary-500" size="xl" />
		</HStack>
	);

	// Si hay onPress, envolver en Pressable
	if (onPress) {
		return <Pressable onPress={() => onPress(id)}>{content}</Pressable>;
	}

	// Si no hay onPress, devolver solo el contenido
	return content;
}

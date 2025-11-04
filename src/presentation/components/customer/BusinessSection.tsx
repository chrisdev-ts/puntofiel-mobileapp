import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { Business, BusinessCategory } from "@/src/core/entities/Business";
import { ListItem } from "@/src/presentation/components/common";
import { BusinessSectionSkeleton } from "@/src/presentation/components/common/skeletons";
import type { LucideIcon } from "lucide-react-native";
import { ArrowRightIcon } from "lucide-react-native";
import { Pressable, ScrollView } from "react-native";

interface BusinessSectionProps {
	/** Título de la sección */
	title: string;
	/** Icono de la sección */
	icon: LucideIcon;
	/** Lista de negocios */
	businesses: Business[];
	/** Estado de carga */
	isLoading: boolean;
	/** Mensaje cuando no hay datos */
	emptyMessage?: string;
	/** Handler para ver todos */
	onViewAll: () => void;
	/** Handler al hacer clic en un negocio */
	onBusinessPress: (businessId: string) => void;
	/** Función para obtener la etiqueta de categoría */
	getCategoryLabel: (category: BusinessCategory) => string;
}

/**
 * Componente de sección de negocios con scroll horizontal
 *
 * Muestra una lista horizontal scrolleable de negocios con:
 * - Título e icono de la sección
 * - Botón "Ver todos"
 * - Cards de negocios con categoría y ubicación
 * - Estado de carga
 * - Mensaje cuando está vacío
 */
export function BusinessSection({
	title,
	icon,
	businesses,
	isLoading,
	emptyMessage,
	onViewAll,
	onBusinessPress,
	getCategoryLabel,
}: BusinessSectionProps) {
	return (
		<VStack space="md">
			{/* Header de la sección */}
			<HStack className="items-center justify-between">
				<HStack space="md" className="items-center">
					<Icon as={icon} className="text-primary-500" size="md" />
					<Heading size="lg" className="text-typography-900">
						{title}
					</Heading>
				</HStack>
				<Pressable onPress={onViewAll}>
					<HStack space="xs" className="items-center">
						<Text size="sm" className="text-primary-500">
							Ver todos
						</Text>
						<Icon as={ArrowRightIcon} className="text-primary-500" size="sm" />
					</HStack>
				</Pressable>
			</HStack>

			{/* Contenido */}
			{isLoading ? (
				<BusinessSectionSkeleton />
			) : businesses && businesses.length > 0 ? (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="-mx-3"
					contentContainerClassName="px-3 gap-3"
				>
					{businesses.map((business) => (
						<Box key={business.id} className="w-48">
							<ListItem
								variant="vertical"
								id={business.id}
								imageUrl={business.logoUrl}
								imageAlt={business.name}
								title={business.name}
								badge={
									<VStack space="xs">
										<Text size="xs" className="text-typography-500">
											{getCategoryLabel(business.category)}
										</Text>
										{business.locationAddress && (
											<Text
												size="xs"
												className="text-typography-400"
												numberOfLines={1}
											>
												{business.locationAddress}
											</Text>
										)}
									</VStack>
								}
								onPress={onBusinessPress}
							/>
						</Box>
					))}
				</ScrollView>
			) : (
				<Text className="text-typography-500">
					{emptyMessage || "No hay negocios disponibles"}
				</Text>
			)}
		</VStack>
	);
}

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "react-native";
import { BusinessCardSkeleton } from "./BusinessCardSkeleton";

/**
 * Skeleton para una sección de negocios con scroll horizontal
 *
 * Replica la estructura de BusinessSection con:
 * - Header con ícono y título
 * - Botón "Ver todos"
 * - Scroll horizontal con 3 cards de negocios
 */
export function BusinessSectionSkeleton() {
	return (
		<VStack space="md">
			{/* Header de la sección */}
			<HStack className="items-center justify-between">
				<HStack space="xs" className="items-center">
					{/* Icono */}
					<Skeleton className="w-6 h-6 rounded" />
					{/* Título */}
					<SkeletonText _lines={1} className="w-32 h-6" />
				</HStack>
				{/* Botón "Ver todos" */}
				<SkeletonText _lines={1} className="w-20 h-4" />
			</HStack>

			{/* Scroll horizontal con cards */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="-mx-3"
				contentContainerClassName="px-3 gap-3"
			>
				{[1, 2, 3].map((index) => (
					<Box key={index} className="w-48">
						<BusinessCardSkeleton />
					</Box>
				))}
			</ScrollView>
		</VStack>
	);
}

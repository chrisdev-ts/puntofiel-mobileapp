import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";
import { ScrollView } from "react-native";
import { BusinessSectionSkeleton } from "./BusinessSectionSkeleton";

/**
 * Skeleton para la pantalla de búsqueda de negocios
 *
 * Muestra el estado de carga completo con:
 * - Título de la pantalla
 * - Barra de búsqueda con botón de filtro
 * - Chips de categorías (scroll horizontal)
 * - Múltiples secciones de negocios
 */
export function SearchBusinessesSkeleton() {
	return (
		<VStack space="lg">
			{/* Título principal */}
			<SkeletonText _lines={1} className="w-3/4 h-9" />

			{/* Barra de búsqueda */}
			<HStack space="sm" className="items-center">
				<Skeleton className="flex-1 h-11 rounded-lg" />
				<Skeleton className="w-11 h-11 rounded-lg" />
			</HStack>

			{/* Chips de categorías */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="-mx-3"
				contentContainerClassName="px-3 gap-2"
			>
				{[1, 2, 3, 4, 5].map((index) => (
					<Skeleton key={index} className="w-24 h-9 rounded-full" />
				))}
			</ScrollView>

			{/* Secciones de negocios */}
			<BusinessSectionSkeleton />
			<BusinessSectionSkeleton />
			<BusinessSectionSkeleton />
		</VStack>
	);
}

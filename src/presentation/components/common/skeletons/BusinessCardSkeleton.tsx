import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

/**
 * Skeleton para la tarjeta vertical de negocio
 *
 * Replica la estructura de ListItem variant="vertical" con:
 * - Imagen cuadrada (aspect-square)
 * - Título
 * - Categoría
 * - Ubicación
 */
export function BusinessCardSkeleton() {
	return (
		<VStack
			className="bg-background-0 border border-background-300 rounded-lg overflow-hidden"
			space="sm"
		>
			{/* Imagen cuadrada */}
			<Skeleton className="w-full aspect-square" />

			{/* Contenido */}
			<VStack className="p-3" space="sm">
				{/* Título del negocio */}
				<SkeletonText _lines={1} className="w-3/4 h-5" />

				{/* Categoría */}
				<SkeletonText _lines={1} className="w-1/2 h-3" />

				{/* Ubicación */}
				<SkeletonText _lines={1} className="w-full h-3" />
			</VStack>
		</VStack>
	);
}

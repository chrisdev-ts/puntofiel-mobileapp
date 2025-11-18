import { Box } from "@/components/ui/box";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

/**
 * Skeleton para el formulario de creación/edición de negocio
 * Muestra placeholders mientras se cargan los datos del negocio en modo edición
 */
export function BusinessFormSkeleton() {
	return (
		<VStack space="lg" className="p-6">
			{/* Progress bar */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-32 h-4" />
				<Skeleton className="w-full h-2 rounded-full" />
			</VStack>

			{/* Título */}
			<SkeletonText _lines={1} className="w-48 h-8" />

			{/* Campos del formulario */}
			<VStack space="md">
				<Box>
					<SkeletonText _lines={1} className="w-40 h-5 mb-2" />
					<Skeleton className="w-full h-12 rounded" />
				</Box>

				<Box>
					<SkeletonText _lines={1} className="w-32 h-5 mb-2" />
					<Skeleton className="w-full h-12 rounded" />
				</Box>

				<Box>
					<SkeletonText _lines={1} className="w-24 h-5 mb-2" />
					<Skeleton className="w-full h-12 rounded" />
				</Box>

				<Box>
					<SkeletonText _lines={1} className="w-48 h-5 mb-2" />
					<Skeleton className="w-full h-20 rounded" />
				</Box>
			</VStack>

			{/* Botones */}
			<VStack space="sm" className="mt-4">
				<Skeleton className="w-full h-12 rounded-lg" />
			</VStack>
		</VStack>
	);
}

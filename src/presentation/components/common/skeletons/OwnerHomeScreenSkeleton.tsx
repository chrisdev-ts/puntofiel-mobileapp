import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

/**
 * Skeleton para la pantalla de inicio del Owner
 * Muestra placeholders mientras se carga la información del negocio
 */
export function OwnerHomeScreenSkeleton() {
	return (
		<VStack space="md">
			{/* Logo del negocio */}
			<Skeleton className="w-full h-48 rounded-lg" />

			{/* Header con nombre y botón editar */}
			<HStack space="md" className="justify-between items-start">
				<VStack space="xs" className="flex-1">
					<SkeletonText _lines={1} className="w-3/4 h-7" />
					<SkeletonText _lines={1} className="w-1/2 h-4" />
				</VStack>
				<Skeleton className="w-24 h-9 rounded" />
			</HStack>

			{/* Dirección */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-24 h-5" />
				<SkeletonText _lines={1} className="w-full h-5" />
			</VStack>

			{/* Horarios */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-20 h-5" />
				<SkeletonText _lines={2} className="w-full h-5" />
			</VStack>
		</VStack>
	);
}

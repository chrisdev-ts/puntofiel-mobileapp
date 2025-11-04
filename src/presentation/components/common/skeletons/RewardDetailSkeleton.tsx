import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

export function RewardDetailSkeleton() {
	return (
		<VStack space="lg" className="pb-6">
			{/* Header con nombre de negocio y puntos (para clientes) */}
			<HStack space="md" className="items-center justify-between px-2">
				<SkeletonText _lines={1} className="w-1/2 h-7" />
				<VStack space="xs" className="items-end">
					<SkeletonText _lines={1} className="w-24 h-3" />
					<SkeletonText _lines={1} className="w-20 h-6" />
				</VStack>
			</HStack>

			{/* Imagen de la recompensa */}
			<Skeleton className="w-full aspect-square rounded-lg" />

			{/* Nombre de la recompensa */}
			<SkeletonText _lines={1} className="w-3/4 h-8" />

			{/* Descripción */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-full h-5" />
				<SkeletonText _lines={1} className="w-full h-5" />
				<SkeletonText _lines={1} className="w-2/3 h-5" />
			</VStack>

			{/* Label y Badge de puntos requeridos */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-32 h-3" />
				<Box className="self-start">
					<SkeletonText _lines={1} className="w-24 h-7" />
				</Box>
			</VStack>

			{/* Información de uso (caja azul) */}
			<Box className="border border-blue-200 bg-blue-50 rounded-lg p-4">
				<HStack space="sm" className="items-start">
					<Skeleton className="w-5 h-5 rounded-full mt-0.5" />
					<VStack space="xs" className="flex-1">
						<SkeletonText _lines={1} className="w-full h-4" />
						<SkeletonText _lines={1} className="w-full h-4" />
						<SkeletonText _lines={1} className="w-3/4 h-4" />
					</VStack>
				</HStack>
			</Box>

			{/* Botón de acción */}
			<Skeleton className="w-full h-12 rounded-lg" />

			{/* Texto adicional debajo del botón */}
			<SkeletonText _lines={1} className="w-2/3 h-4 mx-auto" />
		</VStack>
	);
}

import { Box } from "@/components/ui/box";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

/**
 * Skeleton para la pantalla de registro de puntos de lealtad.
 * Muestra la estructura del formulario mientras se cargan los datos del cliente y negocio.
 */
export function RegisterLoyaltySkeleton() {
	return (
		<Box className="flex-1 bg-white px-6 py-6">
			<VStack space="lg" className="w-full">
				{/* Skeleton del nombre del cliente */}
				<Box>
					<SkeletonText className="w-48 h-7" />
				</Box>

				{/* Skeleton del ícono y descripción */}
				<Box className="items-center gap-3">
					<Skeleton className="w-12 h-12 rounded-full" />
					<SkeletonText className="w-full h-10" _lines={2} />
				</Box>

				{/* Skeleton del formulario */}
				<VStack space="md" className="w-full">
					{/* Campo de monto */}
					<Box>
						<SkeletonText className="w-32 h-5 mb-2" />
						<Skeleton className="w-full h-9 rounded-md" />
					</Box>

					{/* Puntos a otorgar */}
					<SkeletonText className="w-40 h-4" />

					{/* Campo de notas */}
					<Box>
						<SkeletonText className="w-28 h-5 mb-2" />
						<Skeleton className="w-full h-24 rounded-md" />
					</Box>

					{/* Botones */}
					<Box className="flex-row gap-3 mt-4">
						<Skeleton className="flex-1 h-12 rounded-md" />
						<Skeleton className="flex-1 h-12 rounded-md" />
					</Box>
				</VStack>
			</VStack>
		</Box>
	);
}

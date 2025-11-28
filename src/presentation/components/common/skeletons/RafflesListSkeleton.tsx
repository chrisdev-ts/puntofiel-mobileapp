import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

export function RafflesListSkeleton() {
	return (
		<VStack space="md" className="px-4 pt-4">
			{/* Título de la pantalla */}
			<HStack className="justify-between items-center mb-4">
				<SkeletonText _lines={1} className="w-40 h-8" />
				<Skeleton className="w-8 h-8 rounded-full" /> {/* Icono de ayuda */}
			</HStack>

			{/* Lista de tarjetas grandes de rifa */}
			{[1, 2, 3].map((index) => (
				<Box
					key={index}
					className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4"
				>
					{/* Área de Imagen Grande (16:9) */}
					<Skeleton className="w-full h-48" />

					{/* Contenido Inferior */}
					<Box className="p-4">
						<HStack className="justify-between items-center">
							<VStack space="sm" className="flex-1 mr-4">
								{/* Título de la rifa */}
								<SkeletonText _lines={1} className="w-3/4 h-6" />

								{/* Badge de tiempo */}
								<Skeleton className="w-24 h-6 rounded-full mt-1" />
							</VStack>

							{/* Flecha derecha */}
							<Skeleton className="w-6 h-6 rounded-sm" />
						</HStack>
					</Box>
				</Box>
			))}
		</VStack>
	);
}

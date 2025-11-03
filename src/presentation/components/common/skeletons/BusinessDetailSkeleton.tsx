import { View } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

export function BusinessDetailSkeleton() {
	return (
		<VStack space="md">
			{/* Header con imagen del negocio */}
			<Skeleton className="w-full h-[150px] rounded-lg" />

			{/* Nombre del negocio */}
			<SkeletonText _lines={1} className="w-3/4 h-8" />

			{/* Card de puntos */}
			<Box className="p-4 rounded-lg border border-background-200">
				<HStack space="lg" className="justify-between">
					<VStack space="xs" className="flex-1">
						<SkeletonText _lines={1} className="w-20 h-4" />
						<SkeletonText _lines={1} className="w-16 h-10" />
					</VStack>
					<VStack space="xs" className="flex-1 items-end">
						<SkeletonText _lines={1} className="w-24 h-4" />
						<SkeletonText _lines={1} className="w-32 h-6" />
						<SkeletonText _lines={1} className="w-16 h-4" />
					</VStack>
				</HStack>
			</Box>

			{/* Ubicación */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-20 h-5" />
				<SkeletonText _lines={1} className="w-full h-5" />
			</VStack>

			{/* Horarios */}
			<VStack space="xs">
				<SkeletonText _lines={1} className="w-32 h-5" />
				<SkeletonText _lines={1} className="w-3/4 h-5" />
			</VStack>

			{/* Sección de recompensas */}
			<VStack space="md" className="mt-4">
				<SkeletonText _lines={1} className="w-48 h-7" />

				{/* Grid de 2 columnas con cards verticales skeleton */}
				<Box className="p-3 border border-background-300 rounded-xl">
					<View className="flex-row flex-wrap">
						{[1, 2, 3, 4].map((index) => (
							<View key={index} className="w-1/2 p-1.5">
								<VStack className="bg-background-0 border border-background-300 rounded-lg overflow-hidden">
									{/* Imagen cuadrada */}
									<Skeleton className="w-full aspect-square" />

									{/* Contenido */}
									<VStack space="sm" className="p-3">
										{/* Título */}
										<SkeletonText _lines={1} className="w-3/4 h-5" />
										{/* Badge */}
										<SkeletonText _lines={1} className="w-20 h-6" />
										{/* Botón */}
										<Skeleton className="w-full h-10 rounded-md mt-2" />
									</VStack>
								</VStack>
							</View>
						))}
					</View>
				</Box>
			</VStack>
		</VStack>
	);
}

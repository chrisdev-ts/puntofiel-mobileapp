import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { VStack } from "@/components/ui/vstack";

export function HomeScreenSkeleton() {
	return (
		<VStack space="md">
			{/* Título */}
			<SkeletonText _lines={1} className="w-48 h-8" />

			{/* Botón de buscar negocios */}
			<Skeleton className="w-full h-12 rounded-lg" />

			{/* Lista de tarjetas de lealtad */}
			{[1, 2, 3, 4, 5].map((index) => (
				<Box
					key={index}
					className="p-4 rounded-lg border border-background-100"
				>
					<HStack space="md" className="items-center">
						<Skeleton className="w-16 h-16 rounded" />
						<VStack space="xs" className="flex-1">
							<SkeletonText _lines={1} className="w-3/4 h-5" />
							<SkeletonText _lines={1} className="w-1/2 h-4" />
						</VStack>
					</HStack>
				</Box>
			))}
		</VStack>
	);
}

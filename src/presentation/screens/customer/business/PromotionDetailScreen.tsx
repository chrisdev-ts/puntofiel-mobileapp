import { useLocalSearchParams } from "expo-router";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { usePromotionDetail } from "@/src/presentation/hooks/usePromotionDetail";

export default function PromotionDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();

	// Obtener detalle de la promoción
	const { data: promotion, isLoading, error } = usePromotionDetail(id);

	// Obtener datos del negocio asociado (si aplica)
	const { data: businessDetail } = useBusinessDetail(
		promotion?.businessId ?? "",
	);

	if (isLoading) {
		return (
			<AppLayout showHeader showNavBar={false} headerVariant="back">
				<Box className="flex-1 justify-center items-center bg-white">
					<FeedbackScreen variant="loading" title="Cargando promoción..." />
				</Box>
			</AppLayout>
		);
	}

	if (error || !promotion) {
		return (
			<AppLayout showHeader showNavBar={false} headerVariant="back">
				<FeedbackScreen
					variant="error"
					title="Error"
					description="No se encontró la promoción."
				/>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
			headerTitle="Detalle de promoción"
		>
			<VStack space="lg" className="pb-6 px-1">
				{/* Negocio destacado (cliente) */}
				{businessDetail?.business?.name && (
					<HStack space="md" className="items-center justify-between px-2 mb-2">
						<Heading size="lg" className="text-primary-500 flex-1">
							{businessDetail.business.name}
						</Heading>
						<Badge action="info" variant="solid" size="lg">
							<BadgeText>Promoción</BadgeText>
						</Badge>
					</HStack>
				)}

				{/* Imagen cuadrada */}
				<Box className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
					{promotion.imageUrl ? (
						<Image
							source={{ uri: promotion.imageUrl }}
							alt={promotion.title}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<Box className="w-full h-full justify-center items-center">
							<Text className="text-gray-400">Sin imagen</Text>
						</Box>
					)}
				</Box>

				{/* Título */}
				<Heading size="xl" className="text-[#2F4858]">
					{promotion.title}
				</Heading>
				<Text className="text-gray-700 leading-6">
					{promotion.content || "Sin descripción disponible"}
				</Text>

				{/* Estado y fechas */}
				<HStack space="md" className="items-center">
					<Badge action="info" variant="solid" size="md">
						<BadgeText>
							{(() => {
								const startDate = new Date(promotion.startDate);
								const endDate = promotion.endDate
									? new Date(promotion.endDate)
									: null;
								const now = new Date();
								if (endDate && endDate < now) return "Expirada";
								if (startDate > now) return "Próxima";
								return "Activa";
							})()}
						</BadgeText>
					</Badge>
					<Text className="text-xs text-typography-500">
						Inicio: {new Date(promotion.startDate).toLocaleDateString()}
					</Text>
					{promotion.endDate && (
						<Text className="text-xs text-typography-500">
							Fin: {new Date(promotion.endDate).toLocaleDateString()}
						</Text>
					)}
				</HStack>
			</VStack>
		</AppLayout>
	);
}

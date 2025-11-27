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
import { useLocalSearchParams } from "expo-router";

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
			<AppLayout
				showHeader
				headerVariant="back"
				showNavBar={false}
				scrollable
				headerTitle="Detalle de promoción"
			>
				<Box className="flex-1 items-center justify-center py-10">
					<Text className="text-typography-500">Cargando promoción...</Text>
				</Box>
			</AppLayout>
		);
	}

	if (error || !promotion) {
		return (
			<AppLayout
				showHeader
				headerVariant="back"
				showNavBar={false}
				scrollable
				headerTitle="Detalle de promoción"
			>
				<FeedbackScreen
					variant="error"
					title="No se pudo cargar la promoción"
					description="Intenta de nuevo más tarde."
				/>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			showHeader
			headerVariant="back"
			showNavBar={false}
			scrollable
			headerTitle="Detalle de promoción"
		>
			<VStack space="lg">
				{/* Imagen */}
				{promotion.imageUrl || (promotion as any).image_url ? (
					<Image
						source={{ uri: promotion.imageUrl || (promotion as any).image_url }}
						className="w-full h-48 rounded-lg mb-4"
						resizeMode="cover"
					/>
				) : (
					<Box className="w-full h-48 bg-background-300 items-center justify-center rounded-lg mb-4">
						<Text className="text-typography-400">Sin imagen</Text>
					</Box>
				)}

				{/* Título y estado */}
				<HStack space="md" className="items-center justify-between">
					<Heading size="xl" className="text-primary-500 flex-1">
						{promotion.title}
					</Heading>
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
				</HStack>

				{/* Descripción */}
				{promotion.content && (
					<Text className="text-typography-700">{promotion.content}</Text>
				)}

				{/* Fechas */}
				<HStack space="md" className="items-center">
					<Text className="text-xs text-typography-500">
						Inicio:{" "}
						{new Date(
							promotion.startDate || (promotion as any).start_date,
						).toLocaleDateString()}
					</Text>
					{(promotion.endDate || (promotion as any).end_date) && (
						<Text className="text-xs text-typography-500">
							Fin:{" "}
							{new Date(
								promotion.endDate || (promotion as any).end_date,
							).toLocaleDateString()}
						</Text>
					)}
				</HStack>

				{/* Negocio asociado */}
				{businessDetail?.business?.name && (
					<Box>
						<Text className="text-typography-500 text-xs mb-1">Negocio</Text>
						<Text className="text-typography-900 font-semibold">
							{businessDetail.business.name}
						</Text>
					</Box>
				)}
			</VStack>
		</AppLayout>
	);
}

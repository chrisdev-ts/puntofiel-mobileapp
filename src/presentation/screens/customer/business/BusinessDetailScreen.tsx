import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon, GiftIcon } from "lucide-react-native";
import { View } from "react-native";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
	BusinessDetailSkeleton,
	FeedbackScreen,
	ListContainer,
	ListItem,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useReward } from "@/src/presentation/hooks/useReward";

export default function BusinessDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	// Normalizar el ID (puede venir como string o array)
	const businessId = Array.isArray(id) ? id[0] : id;

	console.log("[BusinessDetailScreen] ID recibido:", id);
	console.log("[BusinessDetailScreen] ID normalizado:", businessId);

	// Obtener datos del negocio y loyalty card
	const {
		data: businessDetail,
		isLoading: loadingBusiness,
		error: businessError,
	} = useBusinessDetail(businessId);

	// Obtener recompensas del negocio
	const { rewards, isLoadingRewards, rewardsError } = useReward(businessId);

	// Estado de carga inicial
	if (loadingBusiness || isLoadingRewards) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<BusinessDetailSkeleton />
			</AppLayout>
		);
	}

	// Manejo de errores
	if (businessError) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Error al cargar el negocio"
					description={businessError.message}
				/>
			</AppLayout>
		);
	}

	if (rewardsError) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Error al cargar recompensas"
					description={rewardsError.message}
				/>
			</AppLayout>
		);
	}

	if (!businessDetail) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={false}>
				<FeedbackScreen
					variant="empty"
					icon={AlertCircleIcon}
					title="Negocio no encontrado"
					description="No se pudo encontrar la información del negocio"
				/>
			</AppLayout>
		);
	}

	const { business, loyaltyCard } = businessDetail;
	const currentPoints = loyaltyCard?.points || 0;
	const nextRewardPoints = loyaltyCard?.nextRewardPoints || null;
	const nextRewardName = loyaltyCard?.nextRewardName || null;

	const hasRewards = rewards.length > 0;

	const handleRewardPress = (rewardId: string) => {
		console.log(
			"[BusinessDetailScreen] Navegando a detalle de recompensa:",
			rewardId,
		);
		router.push(`/(customer)/business/rewards/${rewardId}` as never);
	};

	return (
		<AppLayout
			showHeader={true}
			headerVariant="back"
			showNavBar={false}
			scrollable={true}
			headerTitle="Detalle del negocio"
		>
			{/* Header con imagen del negocio */}
			<View className="w-full h-[150px] bg-background-200 rounded-lg overflow-hidden">
				{business.logoUrl ? (
					<Image
						source={{ uri: business.logoUrl }}
						className="w-full h-full"
						resizeMode="cover"
					/>
				) : (
					<View className="w-full h-full bg-background-300 items-center justify-center">
						<Text className="text-typography-400">Sin imagen</Text>
					</View>
				)}
			</View>

			{/* Nombre del negocio */}
			<Heading size="xl" className="text-primary-500">
				{business.name}
			</Heading>

			{/* Card de puntos y próxima recompensa */}
			{loyaltyCard && (
				<Box className="p-4 rounded-lg border border-primary-50">
					<HStack space="lg" className="justify-between items-center">
						{/* Puntos actuales */}
						<VStack space="xs">
							<Text className="text-typography-500 text-sm">
								Tus puntos aquí
							</Text>
							<Heading size="2xl" className="text-primary-600">
								{currentPoints}
							</Heading>
						</VStack>

						{/* Próxima recompensa */}
						{nextRewardName && nextRewardPoints && (
							<VStack space="xs" className="items-end flex-1">
								<Text className="text-typography-500 text-sm">
									Próxima recompensa
								</Text>
								<Text className="text-typography-900 font-semibold text-right">
									{nextRewardName}
								</Text>
								<Text className="text-primary-600 text-xs font-medium">
									{nextRewardPoints} puntos
								</Text>
							</VStack>
						)}
					</HStack>
				</Box>
			)}

			{/* Información de ubicación */}
			{business.locationAddress && (
				<VStack space="xs">
					<Heading size="sm" className="text-typography-900">
						Ubicación
					</Heading>
					<Text className="text-typography-700">
						{business.locationAddress}
					</Text>
				</VStack>
			)}

			{/* Horarios */}
			{business.openingHours && (
				<VStack space="xs">
					<Heading size="sm" className="text-typography-900">
						Horarios de atención
					</Heading>
					<Text className="text-typography-700">{business.openingHours}</Text>
				</VStack>
			)}

			{/* Sección de Recompensas */}
			<View>
				<Heading size="lg" className="text-typography-900">
					Recompensas disponibles
				</Heading>
			</View>

			{/* Estado Vacío de Recompensas */}
			{!hasRewards && (
				<FeedbackScreen
					variant="empty"
					icon={GiftIcon}
					title="Este negocio aún no tiene recompensas"
					description="Vuelve pronto para ver las ofertas exclusivas que tendrán para ti."
				/>
			)}

			{/* Lista de Recompensas */}
			{hasRewards && (
				<ListContainer variant="grid">
					{rewards.map((reward) => {
						const canRedeem = currentPoints >= reward.pointsRequired;

						return (
							<ListItem
								key={reward.id}
								variant="vertical"
								id={reward.id}
								imageUrl={reward.imageUrl}
								imageAlt={reward.name}
								title={reward.name}
								badge={
									<Badge action="success" variant="solid" size="md">
										<BadgeText>{reward.pointsRequired} puntos</BadgeText>
									</Badge>
								}
								onPress={handleRewardPress}
								customAction={
									<Button
										size="md"
										action="primary"
										isDisabled={!canRedeem}
										className={`w-full ${!canRedeem ? "opacity-40" : ""}`}
									>
										<ButtonText size="sm">
											{canRedeem ? "Canjear" : "Insuficientes"}
										</ButtonText>
									</Button>
								}
							/>
						);
					})}
				</ListContainer>
			)}
		</AppLayout>
	);
}

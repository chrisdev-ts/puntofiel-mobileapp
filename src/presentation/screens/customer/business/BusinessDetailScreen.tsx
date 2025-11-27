import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
	FeedbackScreen,
	ListContainer,
	ListItem,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useBusinessRaffles } from "@/src/presentation/hooks/useBusinessRaffles";
import { usePromotions } from "@/src/presentation/hooks/usePromotions";
import { useReward } from "@/src/presentation/hooks/useReward";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckSquare, ClockIcon, GiftIcon } from "lucide-react-native";
import { View } from "react-native";

export default function BusinessDetailScreen() {
	const router = useRouter();
	const { id: businessId } = useLocalSearchParams<{ id: string }>();

	// Datos del negocio y puntos del usuario
	const { data: businessDetail } = useBusinessDetail(businessId);
	const loyaltyCard = businessDetail?.loyaltyCard;
	const currentPoints = loyaltyCard?.points ?? 0;

	// Recompensas
	const { rewards } = useReward(businessId);
	const hasRewards = rewards && rewards.length > 0;

	// Promociones
	const { data: promotions = [], isLoading: isLoadingPromotions } =
		usePromotions(businessId ?? null);

	// Rifas
	const { raffles, isLoading: isLoadingRaffles } = useBusinessRaffles(
		businessId as string,
	);

	return (
		<AppLayout
			showHeader
			headerVariant="back"
			showNavBar={false}
			scrollable
			headerTitle="Detalle del negocio"
		>
			{/* Header con imagen del negocio */}
			<View className="w-full h-[150px] bg-background-200 rounded-lg overflow-hidden">
				{businessDetail?.business?.logoUrl ? (
					<Image
						source={{ uri: businessDetail.business.logoUrl }}
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
				{businessDetail?.business?.name}
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
						{(() => {
							if (!rewards || rewards.length === 0) return null;
							// Buscar la siguiente recompensa a la que el usuario puede aspirar
							const next = rewards
								.filter((r) => r.pointsRequired > currentPoints)
								.sort((a, b) => a.pointsRequired - b.pointsRequired)[0];
							if (!next) return null;
							return (
								<VStack space="xs" className="items-end flex-1">
									<Text className="text-typography-500 text-sm">
										Próxima recompensa
									</Text>
									<Text className="text-typography-900 font-semibold text-right">
										{next.name}
									</Text>
									<Text className="text-primary-600 text-xs font-medium">
										{next.pointsRequired} puntos
									</Text>
								</VStack>
							);
						})()}
					</HStack>
				</Box>
			)}

			{/* Información de ubicación */}
			{businessDetail?.business?.locationAddress && (
				<VStack space="xs">
					<Heading size="sm" className="text-typography-900">
						Ubicación
					</Heading>
					<Text className="text-typography-700">
						{businessDetail.business.locationAddress}
					</Text>
				</VStack>
			)}

			{/* Horarios */}
			{businessDetail?.business?.openingHours && (
				<VStack space="xs">
					<Heading size="sm" className="text-typography-900">
						Horarios de atención
					</Heading>
					<Text className="text-typography-700">
						{businessDetail.business.openingHours}
					</Text>
				</VStack>
			)}

			{/* Sección de Recompensas */}
			<View>
				<Heading size="lg" className="text-typography-900 mb-2">
					Recompensas disponibles
				</Heading>
				{!hasRewards ? (
					<FeedbackScreen
						variant="empty"
						icon={GiftIcon}
						title="Este negocio aún no tiene recompensas"
						description="Vuelve pronto para ver las ofertas exclusivas que tendrán para ti."
					/>
				) : (
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
									onPress={() =>
										router.push({
											pathname: "/(customer)/business/rewards/[id]",
											params: { id: reward.id },
										})
									}
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
			</View>

			{/* Sección de Promociones */}
			<View>
				<Heading size="lg" className="text-typography-900 mb-2">
					Promociones activas
				</Heading>
				{isLoadingPromotions ? (
					<Text className="text-gray-500">Cargando promociones...</Text>
				) : promotions.length === 0 ? (
					<FeedbackScreen
						variant="empty"
						icon={GiftIcon}
						title="Este negocio aún no tiene promociones activas"
						description="Vuelve pronto para ver las promociones que tendrán para ti."
					/>
				) : (
					<ListContainer variant="grid">
						{promotions.map((promotion) => (
							<ListItem
								key={promotion.id}
								id={promotion.id}
								imageUrl={promotion.imageUrl ?? undefined}
								imageAlt={promotion.title}
								title={promotion.title}
								badge={
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
								}
								onPress={() =>
									router.push({
										pathname: "/(customer)/business/promotions/[id]",
										params: { id: promotion.id },
									})
								}
								variant="vertical"
							/>
						))}
					</ListContainer>
				)}
			</View>

			{/* Sección de Rifas */}
			<View>
				<Heading size="lg" className="text-typography-900 mb-2">
					Rifas activas
				</Heading>
				{isLoadingRaffles ? (
					<Text className="text-gray-500">Cargando rifas...</Text>
				) : raffles.length === 0 ? (
					<FeedbackScreen
						variant="empty"
						icon={GiftIcon}
						title="Este negocio aún no tiene rifas activas"
						description="Vuelve pronto para ver los sorteos que tendrán para ti."
					/>
				) : (
					<ListContainer variant="grid">
						{raffles.map((raffle) => {
							const now = new Date();
							const endDate = new Date(raffle.endDate);
							const isActive = !raffle.isCompleted && endDate > now;
							const badgeText = raffle.isCompleted
								? "Finalizada"
								: (() => {
										const diff = Math.ceil(
											(endDate.getTime() - now.getTime()) /
												(1000 * 60 * 60 * 24),
										);
										return diff > 0
											? `Termina en ${diff} días`
											: "Finaliza hoy";
									})();
							const status = raffle.isCompleted
								? "not_participating"
								: raffle.isParticipating
									? "participating"
									: "not_participating";
							return (
								<ListItem
									key={raffle.id}
									id={raffle.id}
									imageUrl={raffle.imageUrl}
									imageAlt={raffle.name}
									title={raffle.name}
									badge={
										<Badge
											action="muted"
											variant="solid"
											className={`rounded-full self-start px-3 py-1 ${isActive ? "bg-[#2F4858]" : "bg-gray-600"}`}
										>
											<Box className="flex-row items-center gap-1">
												<ClockIcon size={16} color="#fff" />
												<BadgeText className="text-white text-xs font-bold ml-1">
													{badgeText}
												</BadgeText>
											</Box>
										</Badge>
									}
									customBadge={
										<Box
											className={`p-2 rounded-lg shadow-sm ${status === "participating" ? (isActive ? "bg-green-500" : "bg-gray-500") : isActive ? "bg-red-500" : "bg-gray-500"}`}
										>
											<CheckSquare size={20} color="#fff" />
										</Box>
									}
									onPress={() =>
										router.push({
											pathname: "/(customer)/business/raffles/[id]",
											params: { id: raffle.id },
										})
									}
									variant="vertical"
								/>
							);
						})}
					</ListContainer>
				)}
			</View>
		</AppLayout>
	);
}

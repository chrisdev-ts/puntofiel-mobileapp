import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import {
	FeedbackScreen,
	ListContainer,
	ListItem,
	RewardsListSkeleton,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useReward } from "@/src/presentation/hooks/useReward";
import { useRouter } from "expo-router";
import { AlertCircleIcon, GiftIcon } from "lucide-react-native";

export default function RewardsIndexScreen() {
	const router = useRouter();

	// Obtener businessId del usuario autenticado
	const {
		data: businessId,
		isLoading: loadingBusiness,
		error: businessError,
	} = useBusinessId();

	// Obtener recompensas del negocio
	const { rewards, isLoadingRewards, rewardsError } = useReward(businessId);

	// Estado de carga inicial
	if (loadingBusiness || isLoadingRewards) {
		return (
			<AppLayout showHeader={true} headerVariant="default" showNavBar={true}>
				<RewardsListSkeleton />
			</AppLayout>
		);
	}

	// Manejo de errores
	if (businessError) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Error al cargar el negocio"
				description={businessError.message}
			/>
		);
	}

	if (rewardsError) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Error al cargar recompensas"
				description={rewardsError.message}
			/>
		);
	}

	const hasRewards = rewards.length > 0;

	const handleCreatePress = () => {
		router.push("/(owner)/rewards/create" as never);
	};

	const handleRewardPress = (rewardId: string) => {
		router.push(`/(owner)/rewards/${rewardId}` as never);
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={true}
			scrollable={true}
			headerVariant="default"
		>
			{/* Título Principal */}
			<Heading size="xl" className="text-primary-500">
				Mis recompensas
			</Heading>
			{/* Botón para crear recompensa */}
			<Button onPress={handleCreatePress} size="md" action="primary">
				<ButtonText>Crear recompensa</ButtonText>
			</Button>
			{/* Botón para promociones */}
			<Button
				onPress={() => router.push("/(owner)/promotions")}
				variant="outline"
				size="md"
			>
				<ButtonText>Promociones</ButtonText>
			</Button>
			{/* Estado Vacío */}
			{!hasRewards && (
				<FeedbackScreen
					variant="empty"
					icon={GiftIcon}
					title="¡Es hora de recompensar a tus clientes!"
					description="Crea ofertas exclusivas para ellos y haz que sigan volviendo a tu negocio. Una recompensa es la forma perfecta de agradecer su lealtad. ¿Qué esperas? ¡Crea tu primera recompensa ahora!"
				/>
			)}
			{/* Lista de Recompensas */}
			{hasRewards && (
				<ListContainer
					showFooterMessage={true}
					footerContent={
						<Text className="text-center text-typography-400">
							¿Tienes otra recompensa que agregar?{"\n"}
							Toca el botón de
							<Text bold className="text-typography-400">
								Crear recompensa
							</Text>
							para crear una nueva.
						</Text>
					}
				>
					{rewards.map((reward) => (
						<ListItem
							key={reward.id}
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
						/>
					))}
				</ListContainer>
			)}
		</AppLayout>
	);
}

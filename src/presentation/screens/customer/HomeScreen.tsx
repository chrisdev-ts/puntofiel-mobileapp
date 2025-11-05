import { useRouter } from "expo-router";
import { AlertCircleIcon, QrCodeIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
	FeedbackScreen,
	HomeScreenSkeleton,
	ListContainer,
	ListItem,
} from "@/src/presentation/components/common";
import { useLoyalty } from "@/src/presentation/hooks/useLoyalty";
import { AppLayout } from "../../components/layout/AppLayout";

export default function HomeScreen() {
	const { data: cards, isLoading, error, refetch } = useLoyalty();
	const router = useRouter();

	// Forzar refetch cuando se monta el componente (debugging)
	useEffect(() => {
		console.log("[HomeScreen] Componente montado, forzando refetch...");
		refetch();
	}, [refetch]);

	console.log("[HomeScreen] Estado actual:", { cards, isLoading, error });

	// 1. Estado de Carga
	if (isLoading) {
		return (
			<AppLayout showHeader={true} headerVariant="default" showNavBar={true}>
				<HomeScreenSkeleton />
			</AppLayout>
		);
	}

	// 2. Estado de Error
	if (error) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Error al cargar"
				description="No pudimos cargar tus tarjetas de fidelidad."
			/>
		);
	}

	// 3. Estado Principal (con datos o vacío)
	return (
		<AppLayout
			showHeader={true}
			showNavBar={true}
			scrollable={true}
			headerVariant="default"
		>
			<Heading size="xl" className="text-primary-500">
				Mis negocios
			</Heading>
			<Button
				variant="solid"
				action="primary"
				onPress={() => router.push("/(customer)/business/search")}
			>
				<ButtonText>Buscar negocios</ButtonText>
			</Button>
			{/* Estado vacío */}
			{!cards || cards.length === 0 ? (
				<FeedbackScreen
					variant="empty"
					icon={QrCodeIcon}
					title="¡Aún no tienes negocios agregados!"
					description="Escanea tu primer QR para empezar a acumular puntos y recibir beneficios en tus locales favoritos."
				/>
			) : (
				/* Lista de negocios */
				<ListContainer>
					{cards.map((card) => (
						<ListItem
							key={String(card.cardId)}
							id={card.businessId}
							imageUrl={card.businessLogoUrl || undefined}
							imageAlt={`Logo de ${card.businessName}`}
							title={card.businessName}
							badge={
								<Badge action="success" variant="solid" size="md">
									<BadgeText>{card.points} puntos</BadgeText>
								</Badge>
							}
							onPress={(businessId) => {
								router.push(`/(customer)/business/${businessId}` as never);
							}}
						/>
					))}
				</ListContainer>
			)}
		</AppLayout>
	);
}

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { Promotion } from "@/src/core/entities/Promotion";
import {
    FeedbackScreen,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { PromotionCard } from "@/src/presentation/components/promotions/PromotionCard";
import { useLoyalty } from "@/src/presentation/hooks/useLoyalty";
import { useRouter } from "expo-router";
import { AlertCircleIcon, GiftIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";

interface PromotionWithBusiness extends Promotion {
	businessName?: string;
	businessId: string;
}

export default function PromotionsScreen() {
	const router = useRouter();

	// Obtener lista de negocios que sigue el customer
	const { data: cards, isLoading: loadingCards, error: cardsError } =
		useLoyalty();

	const [allPromotions, setAllPromotions] = useState<PromotionWithBusiness[]>(
		[]
	);
	const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	// Cargar promociones de todos los negocios
	React.useEffect(() => {
		const loadPromotions = async () => {
			if (!cards || cards.length === 0) {
				setAllPromotions([]);
				return;
			}

			setIsLoadingPromotions(true);
			const promotionsMap: PromotionWithBusiness[] = [];

			// Cargar promociones para cada negocio
			for (const card of cards) {
				try {
					const { data: promos, error } = await (
						await import("@/src/infrastructure/services/supabase")
					).supabase
						.from("promotions")
						.select("*")
						.eq("business_id", card.businessId)
						.eq("is_active", true) // Solo mostrar promociones activas
						.order("created_at", { ascending: false });

					if (error) {
						console.error(
							`[PromotionsScreen] Error loading promotions for business ${card.businessId}:`,
							error
						);
						continue;
					}

					if (promos && promos.length > 0) {
						const businessPromotions = promos.map((promo: any) => ({
							id: promo.id,
							businessId: promo.business_id,
							businessName: card.businessName,
							title: promo.title,
							content: promo.content,
							startDate: promo.start_date,
							endDate: promo.end_date,
							imageUrl: promo.image_url
								? sanitizeUrl(promo.image_url)
								: null,
							isActive: promo.is_active,
							createdAt: promo.created_at,
							updatedAt: promo.updated_at,
						}));

						promotionsMap.push(...businessPromotions);
					}
				} catch (err) {
					console.error(
						`[PromotionsScreen] Exception loading promotions for business ${card.businessId}:`,
						err
					);
				}
			}

			// Ordenar por fecha de creación (más recientes primero)
			promotionsMap.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() -
					new Date(a.createdAt).getTime()
			);

			setAllPromotions(promotionsMap);
			setIsLoadingPromotions(false);
		};

		loadPromotions();
	}, [cards]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		// Recargar negocios y promociones
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const handlePromotionPress = (promotionId: string, businessId: string) => {
		router.push({
			pathname: "/(customer)/business/promotions/[id]",
			params: { id: promotionId, businessId },
		});
	};

	// Estado de carga inicial
	if (loadingCards || isLoadingPromotions) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Promociones"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#3b82f6" />
					<Text className="text-typography-500 mt-4">
						Cargando promociones...
					</Text>
				</View>
			</AppLayout>
		);
	}

	// Estado de error
	if (cardsError) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Promociones"
				showNavBar={false}
			>
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Error al cargar promociones"
					description="No pudimos cargar las promociones disponibles."
				/>
			</AppLayout>
		);
	}

	// Sin negocios registrados
	if (!cards || cards.length === 0) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Promociones"
				showNavBar={false}
				scrollable={true}
			>
				<VStack className="flex-1 justify-center items-center gap-4">
					<GiftIcon className="text-typography-400" size={48} />
					<Text className="text-typography-900 text-lg font-semibold">
						No tienes negocios agregados
					</Text>
					<Text className="text-typography-500 text-center text-sm">
						Agrega negocios para ver sus promociones disponibles
					</Text>
					<Button
						onPress={() => router.push("/(customer)/business/search")}
						variant="solid"
						action="primary"
						size="md"
					>
						<ButtonText>Buscar negocios</ButtonText>
					</Button>
				</VStack>
			</AppLayout>
		);
	}

	// Sin promociones disponibles
	if (allPromotions.length === 0) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Promociones"
				showNavBar={false}
				scrollable={true}
			>
				<VStack className="flex-1 justify-center items-center gap-4">
					<GiftIcon className="text-typography-400" size={48} />
					<Text className="text-typography-900 text-lg font-semibold">
						No hay promociones activas
					</Text>
					<Text className="text-typography-500 text-center text-sm">
						Tus negocios aún no han publicado promociones. Vuelve pronto para
						ver las ofertas exclusivas.
					</Text>
					<Button
						onPress={() => router.back()}
						variant="outline"
						size="md"
					>
						<ButtonText>Volver atrás</ButtonText>
					</Button>
				</VStack>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			headerVariant="back"
			headerTitle="Promociones"
			showNavBar={false}
		>
			<FlatList
				data={allPromotions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View className="px-4">
						<PromotionCard
							promotion={item}
							onPress={() => handlePromotionPress(item.id, item.businessId)}
							showBusinessName={true}
						/>
					</View>
				)}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				contentContainerStyle={{ paddingVertical: 16 }}
				ListHeaderComponent={
					<View className="px-4 mb-4">
						<Heading className="text-2xl font-bold text-gray-800">
							Promociones activas
						</Heading>
						<Text className="text-typography-500 text-sm mt-2">
							{allPromotions.length} promociones disponibles
						</Text>
					</View>
				}
			/>
		</AppLayout>
	);
}

/**
 * Función para sanitizar URLs
 */
function sanitizeUrl(url: string): string {
	if (!url) return "";

	let clean = url.trim();
	clean = decodeURIComponent(clean);
	clean = clean.replace(/\s+$/, "");

	try {
		const urlObj = new URL(clean);
		return urlObj.toString();
	} catch {
		return clean;
	}
}

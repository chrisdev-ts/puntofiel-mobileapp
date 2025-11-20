import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
    FeedbackScreen,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { PromotionCard } from "@/src/presentation/components/promotions/PromotionCard";
import { usePromotions } from "@/src/presentation/hooks/usePromotions";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";

export default function PromotionsIndexScreen() {
	const { id: businessId } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();

	// Normalizar el ID
	const normalizedBusinessId = Array.isArray(businessId)
		? businessId[0]
		: businessId;

	// Obtener promociones del negocio
	const { data: promotions, isLoading, error, refetch } = usePromotions(
		normalizedBusinessId || null
	);

	const [refreshing, setRefreshing] = useState(false);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	const handlePromotionPress = (promotionId: string) => {
		router.push({
			pathname: "/(customer)/business/promotions/[id]",
			params: { id: promotionId },
		});
	};

	// Estado de carga
	if (isLoading) {
		return (
			<AppLayout headerVariant="back" headerTitle="Promociones" showNavBar={false}>
				<View className="flex-1 justify-center items-center">
					<Text className="text-typography-500">Cargando promociones...</Text>
				</View>
			</AppLayout>
		);
	}

	// Estado de error
	if (error) {
		return (
			<AppLayout headerVariant="back" headerTitle="Promociones" showNavBar={false}>
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Error al cargar promociones"
					description={error.message}
				/>
			</AppLayout>
		);
	}

	// Estado vacío
	if (!promotions || promotions.length === 0) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Promociones"
				showNavBar={false}
				scrollable={true}
			>
				<VStack className="flex-1 justify-center items-center gap-4">
					<Text className="text-typography-500 text-lg">
						No hay promociones disponibles
					</Text>
					<Text className="text-typography-400 text-center text-sm">
						Este negocio aún no ha publicado promociones. Vuelve pronto para
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
				data={promotions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View className="px-4">
						<PromotionCard
							promotion={item}
							onPress={() => handlePromotionPress(item.id)}
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
							Promociones disponibles
						</Heading>
					</View>
				}
			/>
		</AppLayout>
	);
}

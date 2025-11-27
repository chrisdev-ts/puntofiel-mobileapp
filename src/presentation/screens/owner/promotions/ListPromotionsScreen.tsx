import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { Promotion } from "@/src/core/entities/Promotion";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { PromotionCard } from "@/src/presentation/components/promotions/PromotionCard";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useDeletePromotion } from "@/src/presentation/hooks/useDeletePromotion";
import { usePromotions } from "@/src/presentation/hooks/usePromotions";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	RefreshControl,
	View,
} from "react-native";

export default function ListPromotionsScreen() {
	const router = useRouter();
	const businessIdQuery = useBusinessId();
	const {
		data: promotions,
		isLoading,
		refetch,
	} = usePromotions(businessIdQuery.data || null);
	const { mutate: deletePromotion } = useDeletePromotion();

	const [refreshing, setRefreshing] = useState(false);

	// const businessId = businessIdQuery.data; // Eliminado porque no se usa

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await refetch();
		setRefreshing(false);
	}, [refetch]);

	const handlePromotionPress = (id: string) => {
		router.push({
			pathname: "/(owner)/promotions/[id]",
			params: { id },
		});
	};

	const handleEdit = (id: string) => {
		router.push({
			pathname: "/(owner)/promotions/edit/[id]",
			params: { id },
		});
	};

	// ✅ CORREGIDO: Pasar la promoción completa, no solo id y title
	const handleDelete = (promotion: Promotion) => {
		Alert.alert(
			"Eliminar promoción",
			`¿Estás seguro de que deseas eliminar la promoción "${promotion.title}"?`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: () => {
						deletePromotion(
							{
								id: promotion.id,
								businessId: promotion.businessId,
								imageUrl: promotion.imageUrl ?? undefined,
							},
							{
								onSuccess: () => {
									Alert.alert("Éxito", "Promoción eliminada correctamente");
									refetch();
								},
								onError: (error: unknown) => {
									let message = "Error al eliminar la promoción";
									if (
										error &&
										typeof error === "object" &&
										"message" in error &&
										typeof (error as Record<string, unknown>).message ===
											"string"
									) {
										message = (error as Record<string, unknown>)
											.message as string;
									}
									Alert.alert("Error", message);
								},
							},
						);
					},
				},
			],
		);
	};

	if (businessIdQuery.isLoading || isLoading) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Mis promociones"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#1f2937" />
				</View>
			</AppLayout>
		);
	}

	if (businessIdQuery.isError) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Mis Promociones"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center ">
					<Text className="text-red-600 text-center mb-4">
						Error: No se pudo cargar tu negocio
					</Text>
					<Button
						onPress={() => router.push("/(owner)/promotions")}
						className="w-full"
						variant="outline"
					>
						<ButtonText>Reintentar</ButtonText>
					</Button>
				</View>
			</AppLayout>
		);
	}

	if (!promotions || promotions.length === 0) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Mis Promociones"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Text className="text-gray-500 text-lg">
						📋 No hay promociones aún
					</Text>
					<Text className="text-gray-400 text-center text-sm">
						Crea tu primera promoción para atraer más clientes
					</Text>
					<Button
						onPress={() => router.push("/(owner)/promotions/create")}
						className="px-6"
						variant="solid"
						action="primary"
					>
						<ButtonText>+ Nueva promoción</ButtonText>
					</Button>
				</View>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			headerVariant="back"
			headerTitle="Mis promociones"
			showNavBar={false}
			scrollable={false}
		>
			<FlatList
				data={promotions}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View>
						<PromotionCard
							promotion={item}
							onPress={() => handlePromotionPress(item.id)}
							onEdit={() => handleEdit(item.id)}
							onDelete={() => handleDelete(item)}
						/>
					</View>
				)}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
				contentContainerStyle={{ paddingVertical: 16 }}
				ListFooterComponent={
					<View>
						<Button
							onPress={() => router.push("/(owner)/promotions/create")}
							className="w-full"
							variant="solid"
							action="primary"
						>
							<ButtonText>+ Nueva promoción</ButtonText>
						</Button>
					</View>
				}
			/>
		</AppLayout>
	);
}

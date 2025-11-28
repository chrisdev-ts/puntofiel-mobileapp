import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { usePromotions } from "@/src/presentation/hooks/usePromotions";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function ListPromotionsScreen() {
	const router = useRouter();
	const businessIdQuery = useBusinessId();
	const { data: promotions, isLoading, refetch } = usePromotions(
		businessIdQuery.data || null,
	);

	// ✅ Refrescar datos automáticamente cuando la pantalla se enfoca
	useFocusEffect(
		useCallback(() => {
			console.log("[ListPromotionsScreen] 🔄 Pantalla enfocada, refrescando...");
			refetch();
		}, [refetch]),
	);

	const handlePromotionPress = (id: string) => {
		router.push({
			pathname: "/(owner)/promotions/[id]",
			params: { id },
		});
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
				headerTitle="Mis promociones"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
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
				headerTitle="Mis promociones"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center px-6">
					<Text className="text-gray-500 text-lg font-semibold mb-2">
						📋 No hay promociones aún
					</Text>
					<Text className="text-gray-400 text-center text-sm mb-6">
						Crea tu primera promoción para atraer más clientes
					</Text>
					<Button
						onPress={() => router.push("/(owner)/promotions/create")}
						className="w-full"
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
					<View className="px-4 py-2">
						<View
							className="bg-white rounded-lg p-4 border border-gray-200 active:bg-gray-50"
							onTouchEnd={() => handlePromotionPress(item.id)}
						>
							<Text className="text-base font-semibold text-gray-900">
								{item.title}
							</Text>
							<Text
								className="text-sm text-gray-600 mt-1"
								numberOfLines={2}
							>
								{item.content}
							</Text>
						</View>
					</View>
				)}
				contentContainerStyle={{ paddingVertical: 8 }}
				ListHeaderComponent={
					<VStack space="md" className="px-4 py-4">
						<Text className="text-2xl font-bold text-gray-900">
							Mis Promociones
						</Text>
						<Button
							onPress={() => router.push("/(owner)/promotions/create")}
							className="w-full"
							variant="solid"
							action="primary"
						>
							<Plus size={18} color="white" />
							<ButtonText className="ml-2">Nueva promoción</ButtonText>
						</Button>
					</VStack>
				}
				ListFooterComponent={
					<View className="px-4 py-6 items-center">
						<Text className="text-center text-sm text-gray-500">
							¿Tienes otra promoción que agregar?{"\n"}
							Toca el botón de {"\n"}
							<Text className="font-semibold">+ Nueva promoción</Text>
							{" "}para crear una nueva.
						</Text>
					</View>
				}
			/>
		</AppLayout>
	);
}

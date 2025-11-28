import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ListContainer, ListItem } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { usePromotions } from "@/src/presentation/hooks/usePromotions";

export default function ListPromotionsScreen() {
	const router = useRouter();
	const businessIdQuery = useBusinessId();
	const { data: promotions, isLoading } = usePromotions(
		businessIdQuery.data || null,
	);

	// const businessId = businessIdQuery.data; // Eliminado porque no se usa

	const handlePromotionPress = (id: string) => {
		router.push({
			pathname: "/(owner)/promotions/[id]",
			params: { id },
		});
	};

	// ✅ CORREGIDO: Pasar la promoción completa, no solo id y title

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
				headerTitle="Mis promociones"
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
			scrollable={true}
		>
			<Button
				onPress={() => router.push("/(owner)/promotions/create")}
				className="w-full"
				variant="solid"
				action="primary"
			>
				<ButtonText>Nueva promoción</ButtonText>
			</Button>
			<ListContainer
				showFooterMessage={true}
				footerContent={
					<Text className="text-center text-typography-400">
						¿Tienes otra promoción que agregar?{"\n"}
						Toca el botón de{" "}
						<Text bold className="text-typography-400">
							+ Nueva promoción
						</Text>{" "}
						para crear una nueva.
					</Text>
				}
			>
				{promotions.map((promotion) => (
					<ListItem
						key={promotion.id}
						id={promotion.id}
						imageUrl={promotion.imageUrl ?? undefined}
						imageAlt={promotion.title}
						title={promotion.title}
						onPress={() => handlePromotionPress(promotion.id)}
					/>
				))}
			</ListContainer>
		</AppLayout>
	);
}

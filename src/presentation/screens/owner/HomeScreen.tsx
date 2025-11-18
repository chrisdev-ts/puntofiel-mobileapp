import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { BusinessCategory } from "@/src/core/entities/Business";
import { SupabaseBusinessRepository } from "@/src/infrastructure/repositories/SupabaseBusinessRepository";
import { OwnerHomeScreenSkeleton } from "@/src/presentation/components/common/skeletons";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Edit3Icon } from "lucide-react-native";
import { View } from "react-native";

const businessRepository = new SupabaseBusinessRepository();

// Mapeo de categorías de inglés a español
const CATEGORY_LABELS: Record<BusinessCategory, string> = {
	food: "Comida",
	cafe: "Cafetería",
	restaurant: "Restaurante",
	retail: "Retail/Ropa",
	services: "Servicios",
	entertainment: "Entretenimiento",
	health: "Salud y Bienestar",
	other: "Otro",
};

export default function DashboardScreen() {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);

	// Obtener negocio del owner
	const { data: businesses, isLoading } = useQuery({
		queryKey: ["businesses", "owner", user?.id],
		queryFn: async () => {
			if (!user?.id) return [];
			return await businessRepository.getBusinessesByOwner(user.id);
		},
		enabled: !!user?.id,
	});

	const business = businesses?.[0]; // Primer negocio (solo puede tener uno)

	const handleEditBusiness = () => {
		if (business?.id) {
			router.push({
				pathname: "/(owner)/business/edit",
				params: { id: business.id },
			});
		}
	};

	// Función para obtener la etiqueta en español de la categoría
	const getCategoryLabel = (category: BusinessCategory): string => {
		return CATEGORY_LABELS[category] || category;
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={true}
			scrollable={true}
			headerVariant="default"
		>
			{/* Información del Negocio */}
			{isLoading ? (
				<OwnerHomeScreenSkeleton />
			) : business ? (
				<Box className="p-3 gap-4 border border-gray-300 rounded-lg">
					{/* Header con imagen del negocio */}
					<View className="w-full h-[150px] bg-background-200 rounded-lg overflow-hidden">
						{business.logoUrl ? (
							<Image
								source={{ uri: business.logoUrl }}
								className="w-full h-full"
								resizeMode="cover"
								alt={`Logo de ${business.name}`}
							/>
						) : (
							<View className="w-full h-full bg-background-300 items-center justify-center">
								<Text className="text-typography-400">Sin imagen</Text>
							</View>
						)}
					</View>

					{/* Nombre del negocio con botón de editar */}
					<HStack className="justify-between items-center">
						<Heading size="xl" className="text-primary-500 flex-1">
							{business.name}
						</Heading>
						<Button
							variant="outline"
							action="primary"
							size="sm"
							onPress={handleEditBusiness}
						>
							<ButtonIcon as={Edit3Icon} />
							<ButtonText>Editar</ButtonText>
						</Button>
					</HStack>

					{/* Categoría */}
					<VStack space="xs">
						<Heading size="sm" className="text-typography-900">
							Categoría
						</Heading>
						<Text className="text-typography-700">
							{getCategoryLabel(business.category)}
						</Text>
					</VStack>

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
							<Text className="text-typography-700">
								{business.openingHours}
							</Text>
						</VStack>
					)}
				</Box>
			) : (
				<Box className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
					<Text className="text-center text-yellow-800">
						No se encontró información del negocio
					</Text>
				</Box>
			)}
		</AppLayout>
	);
}

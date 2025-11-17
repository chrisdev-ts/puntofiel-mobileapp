import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { BusinessCategory } from "@/src/core/entities/Business";
import { SupabaseBusinessRepository } from "@/src/infrastructure/repositories/SupabaseBusinessRepository";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuthStore } from "@/src/presentation/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Edit3Icon } from "lucide-react-native";

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
            <VStack className="gap-6">
                <Heading size="xl" className="text-primary-500">
                    Dashboard
                </Heading>

                {/* Información del Negocio */}
                {isLoading ? (
                    <Card className="p-4">
                        <VStack className="gap-3">
                            <Skeleton className="h-6 w-48 rounded" />
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-32 w-full rounded" />
                        </VStack>
                    </Card>
                ) : business ? (
                    <Card className="p-4 bg-white">
                        <VStack className="gap-4">
                            <HStack className="justify-between items-start">
                                <VStack className="flex-1 gap-1">
                                    <Heading size="lg" className="text-gray-900">
                                        {business.name}
                                    </Heading>
                                    <Text className="text-sm text-gray-600">
                                        {getCategoryLabel(business.category)}
                                    </Text>
                                </VStack>
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

                            {business.logoUrl && (
                                <Image
                                    source={{ uri: business.logoUrl }}
                                    alt={`Logo de ${business.name}`}
                                    className="w-full h-40 rounded-lg"
                                    resizeMode="cover"
                                />
                            )}

                            {business.locationAddress && (
                                <VStack className="gap-1">
                                    <Text className="text-sm font-semibold text-gray-700">
                                        Dirección:
                                    </Text>
                                    <Text className="text-sm text-gray-600">
                                        {business.locationAddress}
                                    </Text>
                                </VStack>
                            )}

                            {business.openingHours && (
                                <VStack className="gap-1">
                                    <Text className="text-sm font-semibold text-gray-700">
                                        Horarios:
                                    </Text>
                                    <Text className="text-sm text-gray-600">
                                        {business.openingHours}
                                    </Text>
                                </VStack>
                            )}
                        </VStack>
                    </Card>
                ) : (
                    <Card className="p-4 bg-yellow-50 border border-yellow-200">
                        <Text className="text-center text-yellow-800">
                            No se encontró información del negocio
                        </Text>
                    </Card>
                )}

                {/* Estadísticas rápidas - Por implementar */}
                <Box className="bg-gray-100 p-4 rounded-lg">
                    <Text className="text-center text-typography-600">
                        Estadísticas próximamente...
                    </Text>
                </Box>
            </VStack>
        </AppLayout>
    );
}
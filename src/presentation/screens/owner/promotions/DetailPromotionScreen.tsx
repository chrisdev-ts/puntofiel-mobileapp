import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import type { Promotion } from '@/src/core/entities/Promotion';
import { useDeletePromotion } from '@/src/presentation/hooks/useDeletePromotion';
import { usePromotion } from '@/src/presentation/hooks/usePromotion';
import { useUpdatePromotion } from '@/src/presentation/hooks/useUpdatePromotion';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image as RNImage, View } from 'react-native';

export default function DetailPromotionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: promotion, isLoading, refetch } = usePromotion(id!);
  const { mutate: updatePromotion } = useUpdatePromotion();
  const { mutate: deletePromotion } = useDeletePromotion();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Spinner />
      </View>
    );
  }

  // ✅ Validar tipo y casting
  if (!promotion || Array.isArray(promotion)) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Promoción no encontrada</Text>
      </View>
    );
  }

  const promotionData = promotion as Promotion;

  // ✅ Validar endDate después del casting
  if (!promotionData.endDate) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>Fecha de finalización inválida</Text>
      </View>
    );
  }

  // Calcular días restantes
  const endDate = new Date(promotionData.endDate);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  // Manejar activación/desactivación
  const handleToggleStatus = () => {
    const newStatus = !promotionData.isActive;
    updatePromotion(
      {
        id: promotionData.id,
        data: {
          isActive: newStatus, // ✅ Solo actualizar el estado
        },
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Éxito',
            `La promoción se ${newStatus ? 'activó' : 'desactivó'}`
          );
          // 🔄 Recargar datos después de actualizar
          setTimeout(() => {
            refetch?.();
          }, 500);
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Error al actualizar');
        },
      }
    );
  };

  // Manejar eliminación
  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Deseas eliminar esta promoción?',
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Eliminar',
          onPress: () => {
            deletePromotion(
              {
                id: promotionData.id,
                businessId: promotionData.businessId,
                 imageUrl: promotionData.imageUrl ?? undefined,
              },
              {
                onSuccess: () => {
                  Alert.alert('Éxito', 'Promoción eliminada');
                  router.push('/(owner)/promotions');
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message || 'Error al eliminar');
                },
              }
            );
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Manejar edición
  const handleEdit = () => {
    router.push({
      pathname: '/(owner)/promotions/edit/[id]',
      params: { id: promotionData.id },
    });
  };

  return (
    <View className="flex-1 px-6 py-4 bg-white">
      {/* Imagen de la promoción */}
      {promotionData.imageUrl && (
        <RNImage
          source={{ uri: promotionData.imageUrl }}
          className="w-full h-48 rounded-lg mb-4 bg-gray-200"
          resizeMode="cover"
        />
      )}

      {/* Tarjeta de información */}
      <Card className="p-4 mb-6 bg-gray-50 rounded-lg border border-gray-200">
        <VStack className="gap-3">
          <Text className="text-2xl font-bold text-gray-900">
            {promotionData.title}
          </Text>
          <Text className="text-base text-gray-600 leading-6">
            {promotionData.content}
          </Text>

          {/* Badge de estado */}
          <HStack className="gap-3 mt-2">
            <Badge
              className={
                promotionData.isActive
                  ? 'bg-green-100 rounded-full'
                  : 'bg-red-100 rounded-full'
              }
            >
              <BadgeText
                className={
                  promotionData.isActive
                    ? 'text-green-700 text-sm font-semibold'
                    : 'text-red-700 text-sm font-semibold'
                }
              >
                {promotionData.isActive ? 'Activada' : 'Desactivada'}
              </BadgeText>
            </Badge>

            {/* Días restantes */}
            {daysRemaining > 0 && (
              <Badge className="bg-blue-100 rounded-full">
                <BadgeText className="text-blue-700 text-sm font-semibold">
                  {daysRemaining} días
                </BadgeText>
              </Badge>
            )}
            {daysRemaining <= 0 && (
              <Badge className="bg-red-100 rounded-full">
                <BadgeText className="text-red-700 text-sm font-semibold">
                  Vencida
                </BadgeText>
              </Badge>
            )}
          </HStack>
        </VStack>
      </Card>

      {/* Botones de acción */}
      <VStack className="gap-3 mt-auto mb-4">
        {/* Botón de activar/desactivar */}
        <Button
          onPress={handleToggleStatus}
          className="w-full"
          variant="solid"
          action={promotionData.isActive ? 'error' : 'success'}
        >
          <ButtonText>
            {promotionData.isActive ? 'Desactivar' : 'Activar'}
          </ButtonText>
        </Button>

        {/* Botón de editar (solo si está activada) */}
        {promotionData.isActive && (
          <Button
            onPress={handleEdit}
            className="w-full"
            variant="solid"
            action="primary"
          >
            <ButtonText>Editar promoción</ButtonText>
          </Button>
        )}

        {/* Botón de eliminar */}
        <Button
          onPress={handleDelete}
          className="w-full"
          variant="solid"
          action="error"
        >
          <ButtonText>Eliminar promoción</ButtonText>
        </Button>

        {/* Botón para volver al Home */}
        <Button
          onPress={() => router.push('/(owner)/(tabs)/home')}
          className="w-full"
          variant="outline"
        >
          <ButtonText>Volver al inicio</ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
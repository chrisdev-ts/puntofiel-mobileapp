import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, View } from 'react-native';

import type { Promotion } from '@/src/core/entities/Promotion';
import { PromotionCard } from '@/src/presentation/components/promotions/PromotionCard';
import { useBusinessId } from '@/src/presentation/hooks/useBusinessId';
import { useDeletePromotion } from '@/src/presentation/hooks/useDeletePromotion';
import { usePromotions } from '@/src/presentation/hooks/usePromotions';

import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function ListPromotionsScreen() {
  const router = useRouter();
  const businessIdQuery = useBusinessId();
  const { data: promotions, isLoading, refetch } = usePromotions(
    businessIdQuery.data || null
  );
  const { mutate: deletePromotion } = useDeletePromotion();

  const [refreshing, setRefreshing] = useState(false);

  const businessId = businessIdQuery.data;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePromotionPress = (id: string) => {
    router.push({
      pathname: '/(owner)/promotions/[id]',
      params: { id },
    });
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: '/(owner)/promotions/edit/[id]',
      params: { id },
    });
  };

  // ✅ CORREGIDO: Pasar la promoción completa, no solo id y title
  const handleDelete = (promotion: Promotion) => {
    Alert.alert(
      'Eliminar promoción',
      `¿Estás seguro de que deseas eliminar la promoción "${promotion.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deletePromotion(
              {
                id: promotion.id,
                businessId: promotion.businessId,
                imageUrl: promotion.imageUrl ?? undefined,
              },
              {
                onSuccess: () => {
                  Alert.alert('Éxito', 'Promoción eliminada correctamente');
                  refetch();
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message || 'Error al eliminar la promoción');
                },
              }
            );
          },
        },
      ]
    );
  };

  if (businessIdQuery.isLoading || isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1f2937" />
      </View>
    );
  }

  if (businessIdQuery.isError) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-600 text-center mb-4">
          Error: No se pudo cargar tu negocio
        </Text>
        <Button
          onPress={() => router.push('/(owner)/promotions')}
          className="w-full"
          variant="outline"
        >
          <ButtonText>Reintentar</ButtonText>
        </Button>
      </View>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <View className="flex-1 bg-white px-6 py-8">
        <VStack className="flex-1 justify-center items-center gap-4">
          <Text className="text-gray-500 text-lg">📋 No hay promociones aún</Text>
          <Text className="text-gray-400 text-center text-sm">
            Crea tu primera promoción para atraer más clientes
          </Text>
          <Button
            onPress={() => router.push('/(owner)/promotions/create')}
            className="px-6"
            variant="solid"
            action="primary"
          >
            <ButtonText>+ Nueva promoción</ButtonText>
          </Button>
        </VStack>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4">
            <PromotionCard
              promotion={item}
              onPress={() => handlePromotionPress(item.id)}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item)} // ✅ Pasar la promoción completa
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 16 }}
        ListHeaderComponent={
          <View className="px-4 mb-4">
            <Heading className="text-2xl font-bold text-gray-800 mb-2">
              Promociones
            </Heading>
            <Text className="text-gray-600 mb-4">
              {promotions.length} promoción{promotions.length !== 1 ? 'es' : ''}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View className="px-4 py-4">
            <Button
              onPress={() => router.push('/(owner)/promotions/create')}
              className="w-full"
              variant="solid"
              action="primary"
            >
              <ButtonText>+ Nueva promoción</ButtonText>
            </Button>
          </View>
        }
      />
    </View>
  );
}
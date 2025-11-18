import type { Promotion } from '@/src/core/entities/Promotion';
import { CreatePromotionUseCase } from '@/src/core/usecases/promotion/CreatePromotionUseCase';
import { useMutation } from '@tanstack/react-query';

interface CreatePromotionParams {
  businessId: string;
  title: string;
  content: string;
  startDate: Date;
  endDate?: Date;
  imageUrl?: string;
}

export const useCreatePromotion = () => {
  const useCase = new CreatePromotionUseCase();

  return useMutation<Promotion, Error, CreatePromotionParams>({
    mutationFn: async (params) => {
      console.log('[useCreatePromotion] Iniciando creación con parámetros:', params);
      return await useCase.execute(params);
    },
    onSuccess: (data) => {
      console.log('[useCreatePromotion] Promoción creada exitosamente:', data);
    },
    onError: (error) => {
      console.error('[useCreatePromotion] Error:', error.message);
    },
  });
};
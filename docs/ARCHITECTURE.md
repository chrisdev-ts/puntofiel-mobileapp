# Cómo añadir una feature

## El flujo de datos

El flujo siempre es el mismo. Las dependencias **solo van hacia adentro**.

`UI (React) ➔ Hook (ViewModel) ➔ UseCase (Core) ➔ Repository (Core) ➔ Implementation (Infra) ➔ Supabase`

## Añadir una nueva feature

Sigue estos 4 pasos en orden.

### Paso 1. El cerebro (Capa `core`)

*Define el "qué" y la lógica de negocio pura. Cero `import` de React o Supabase aquí.*

1.  **Define el contrato (Interfaz):** ¿Qué necesitas de la base de datos?

      * **Archivo:** `src/core/repositories/INuevaFeatureRepository.ts`
        ```typescript
        import { Reward } from '@/src/core/entities/Reward';

        export interface IRewardRepository {
          getRedeemedRewards(userId: string): Promise<Reward[]>;
          redeemReward(userId: string, rewardId: string): Promise<void>;
        }
        ```

2.  **Define el caso de uso (La acción):** La lógica de negocio específica.

      * **Archivo:** `src/core/usecases/feature/miCasoDeUso.ts`
        ```typescript
        import { IRewardRepository } from '@/src/core/repositories/IRewardRepository';

        export class RedeemRewardUseCase {
          constructor(private rewardRepo: IRewardRepository) {}

          async execute(userId: string, rewardId: string) {
            // Aquí puede ir lógica de negocio (validaciones, etc.)
            if (!userId || !rewardId) {
              throw new Error('Datos de canje inválidos');
            }
            await this.rewardRepo.redeemReward(userId, rewardId);
          }
        }
        ```

### Paso 2. Las manos (Capa `infrastructure`)

*Implementa el "cómo". Aquí es el *único* lugar donde hablas con Supabase.*

1.  **Implementa el contrato:** Crea la clase que usa Supabase para cumplir el contrato del Paso 1.
      * **Archivo:** `src/infrastructure/repositories/SupabaseRewardRepository.ts`
        ```typescript
        import { IRewardRepository } from '@/src/core/repositories/IRewardRepository';
        import { supabase } from '@/src/infrastructure/services/supabase'; // ✅ OK importar Supabase aquí

        export class SupabaseRewardRepository implements IRewardRepository {
          async redeemReward(userId: string, rewardId: string) {
            const { error } = await supabase.rpc('redeem_reward_procedure', {
              p_user_id: userId,
              p_reward_id: rewardId,
            });

            if (error) {
              throw new Error(`Error de Supabase: ${error.message}`);
            }
          }
          // ... implementar getRedeemedRewards
        }
        ```

### Paso 3. La cara (Capa `presentation`)

*La UI y su estado. El "pegamento" entre React y nuestro `core`.*

1.  **Crea el Hook (ViewModel):** Conecta React con el Caso de Uso. **Usa TanStack Query (`useMutation` / `useQuery`)** para manejar estados (loading, error, success).

      * **Archivo:** `src/presentation/hooks/useReward.ts`
        ```typescript
        import { useMutation } from '@tanstack/react-query';
        import { RedeemRewardUseCase } from '@/src/core/usecases/reward/redeemReward';
        import { SupabaseRewardRepository } from '@/src/infrastructure/repositories/SupabaseRewardRepository';

        // Instanciamos las dependencias aquí
        const rewardRepository = new SupabaseRewardRepository();
        const redeemRewardUseCase = new RedeemRewardUseCase(rewardRepository);

        export const useReward = () => {
          const mutation = useMutation({
            mutationFn: (params: { userId: string; rewardId: string }) =>
              redeemRewardUseCase.execute(params.userId, params.rewardId),
          });

          return {
            redeem: mutation.mutate,
            isLoading: mutation.isPending,
            error: mutation.error,
            isSuccess: mutation.isSuccess,
          };
        };
        ```

2.  **Crea la Screen (Vista):** Un componente React "tonto" que solo usa el hook. Este archivo contiene la interfaz de usuario.

      * **Archivo:** `src/presentation/screens/reward/RedeemRewardScreen.tsx`
        ```typescript
        import { Button, Text } from '@gluestack-ui/themed';
        import { useReward } from '@/src/presentation/hooks/useReward';

        export default function RedeemRewardScreen() {
          const { redeem, isLoading, error } = useReward();

          const handlePress = () => {
            redeem({ userId: 'user-123', rewardId: 'reward-abc' });
          };

          return (
            <>
              <Button onPress={handlePress} isDisabled={isLoading}>
                <Text>{isLoading ? 'Canjeando...' : 'Canjear Recompensa'}</Text>
              </Button>
              {error && <Text color="$red500">{error.message}</Text>}
            </>
          );
        }
        ```

### Paso 4. El mapa (Capa `app`)

*El paso final. Conecta tu *Screen* para que el usuario pueda verla usando Expo Router.*

1.  **Define la Ruta:** Crea el archivo en `app/` que renderiza tu *Screen*.
      * **Archivo:** `app/reward/redeem.tsx`
        ```typescript
        import RedeemRewardScreen from '@/src/presentation/screens/reward/RedeemRewardScreen';
        import { Stack } from 'expo-router';

        export default function RedeemRewardRoute() {
          return (
            <>
              <Stack.Screen options={{ title: 'Canjear' }} />
              <RedeemRewardScreen />
            </>
          );
        }
        ```
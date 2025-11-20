import type {
    CreateRaffleDTO,
    UpdateRaffleDTO,
} from "@/src/core/entities/AnnualRaffle";
import { CreateRaffleUseCase } from "@/src/core/usecases/raffle/CreateRaffleUseCase";
import { DeleteRaffleUseCase } from "@/src/core/usecases/raffle/DeleteRaffleUseCase";
import { GetRafflesUseCase } from "@/src/core/usecases/raffle/GetRafflesUseCase";
import { UpdateRaffleUseCase } from "@/src/core/usecases/raffle/UpdateRaffleUseCase";
import { SupabaseRaffleRepository } from "@/src/infrastructure/repositories/SupabaseRaffleRepository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Instancias de casos de uso (Dependency Injection)
// Aquí conectamos la infraestructura (Supabase) con la lógica de negocio
const raffleRepository = new SupabaseRaffleRepository();
const getRafflesUseCase = new GetRafflesUseCase(raffleRepository);
const createRaffleUseCase = new CreateRaffleUseCase(raffleRepository);
const updateRaffleUseCase = new UpdateRaffleUseCase(raffleRepository);
const deleteRaffleUseCase = new DeleteRaffleUseCase(raffleRepository);

export function useRaffle(businessId: string | undefined) {
    const queryClient = useQueryClient();

    // 1. Query: Listar rifas anuales
    const {
        data: raffles,
        isLoading: isLoadingRaffles,
        error: rafflesError,
        refetch: refetchRaffles,
    } = useQuery({
        queryKey: ["raffles", businessId],
        queryFn: () => getRafflesUseCase.execute(businessId as string),
        enabled: !!businessId, // Solo ejecuta si hay businessId
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
    });

    // 2. Mutation: Crear rifa
    const createRaffleMutation = useMutation({
        mutationFn: async ({
            dto,
            imageUri,
        }: {
            dto: CreateRaffleDTO;
            imageUri?: string;
        }) => {
            return createRaffleUseCase.execute(dto, imageUri);
        },
        onSuccess: () => {
            // Recargar la lista de rifas automáticamente
            queryClient.invalidateQueries({ queryKey: ["raffles", businessId] });
        },
    });

    // 3. Mutation: Actualizar rifa
    const updateRaffleMutation = useMutation({
        mutationFn: async ({
            raffleId,
            dto,
            imageUri,
        }: {
            raffleId: string;
            dto: UpdateRaffleDTO;
            imageUri?: string;
        }) => {
            return updateRaffleUseCase.execute(raffleId, dto, imageUri);
        },
        onSuccess: (data) => {
            // Recargar la lista y el detalle específico de esa rifa
            queryClient.invalidateQueries({ queryKey: ["raffles", businessId] });
            queryClient.invalidateQueries({ queryKey: ["raffle", data.id] });
        },
    });

    // 4. Mutation: Eliminar rifa
    const deleteRaffleMutation = useMutation({
        mutationFn: async (raffleId: string) => {
            if (!businessId) throw new Error("businessId es requerido");
            return deleteRaffleUseCase.execute(raffleId, businessId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["raffles", businessId] });
        },
    });

    return {
        // Estado de lectura (Query)
        raffles: raffles || [],
        isLoadingRaffles,
        rafflesError,
        refetchRaffles,

        // Acción Crear
        createRaffle: createRaffleMutation.mutateAsync, // Usamos mutateAsync para poder hacer await en el form
        isCreating: createRaffleMutation.isPending,
        createError: createRaffleMutation.error,
        createSuccess: createRaffleMutation.isSuccess,
        resetCreate: createRaffleMutation.reset,

        // Acción Actualizar
        updateRaffle: updateRaffleMutation.mutateAsync,
        isUpdating: updateRaffleMutation.isPending,
        updateError: updateRaffleMutation.error,
        updateSuccess: updateRaffleMutation.isSuccess,
        resetUpdate: updateRaffleMutation.reset,

        // Acción Eliminar
        deleteRaffle: deleteRaffleMutation.mutateAsync,
        isDeleting: deleteRaffleMutation.isPending,
        deleteError: deleteRaffleMutation.error,
        deleteSuccess: deleteRaffleMutation.isSuccess,
        resetDelete: deleteRaffleMutation.reset,
    };
}
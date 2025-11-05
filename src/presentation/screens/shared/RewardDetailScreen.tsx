import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon, EditIcon, InfoIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
	FeedbackScreen,
	RewardDetailSkeleton,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useReward } from "@/src/presentation/hooks/useReward";
import { useRewardDetail } from "@/src/presentation/hooks/useRewardDetail";

export default function RewardDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { user } = useAuth();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const toast = useToast();

	const isOwner = user?.role === "owner";
	const isCustomer = user?.role === "customer";

	// Obtener businessId (solo para owner al eliminar)
	const { data: ownBusinessId } = useBusinessId();

	// Cargar datos de la recompensa
	const { data: reward, isLoading: loadingReward, error } = useRewardDetail(id);

	// Solo cargar datos del negocio si es cliente y hay businessId
	const businessId = reward?.businessId || "";
	const shouldLoadBusiness = isCustomer && !!reward?.businessId;
	const { data: businessDetail, isLoading: loadingBusiness } =
		useBusinessDetail(shouldLoadBusiness ? businessId : "");

	// Hook de mutation para eliminar (solo owner)
	const { deleteReward, isDeleting, deleteSuccess, deleteError } =
		useReward(ownBusinessId);

	const isLoading = loadingReward || (isCustomer && loadingBusiness);

	// Navegar cuando se elimine exitosamente
	useEffect(() => {
		if (deleteSuccess) {
			toast.show({
				placement: "top",
				duration: 3000,
				render: ({ id }) => {
					const uniqueToastId = `toast-${id}`;
					return (
						<Toast nativeID={uniqueToastId} action="success" variant="solid">
							<ToastTitle>Éxito</ToastTitle>
							<ToastDescription>
								Recompensa desactivada correctamente
							</ToastDescription>
						</Toast>
					);
				},
			});
			setTimeout(() => router.back(), 500);
		}
	}, [deleteSuccess, router, toast]);

	if (isLoading) {
		return (
			<AppLayout
				showHeader={true}
				showNavBar={false}
				headerVariant="back"
				headerTitle="Detalle de recompensa"
			>
				<RewardDetailSkeleton />
			</AppLayout>
		);
	}

	if (error || !reward) {
		return (
			<AppLayout
				showHeader={true}
				showNavBar={false}
				headerVariant="back"
				headerTitle="Detalle de recompensa"
			>
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Recompensa no encontrada"
					description={error?.message || "No se encontró la recompensa"}
				/>
			</AppLayout>
		);
	}

	// Datos específicos para clientes
	const { business, loyaltyCard } = businessDetail || {};
	const currentPoints = loyaltyCard?.points || 0;
	const canRedeem = currentPoints >= reward.pointsRequired;

	// Handlers
	const handleRedeemPress = () => {
		console.log("[RewardDetailScreen] Canjear recompensa:", reward.id);
		// TODO: Implementar lógica de canje
	};

	const handleEditPress = () => {
		router.push(`/(owner)/rewards/edit/${reward.id}` as never);
	};

	const handleDeletePress = () => {
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = () => {
		setShowDeleteModal(false);
		deleteReward(id);
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
			headerTitle="Detalle de recompensa"
		>
			<VStack space="lg" className="pb-6">
				{/* Nombre del negocio y puntos del usuario (solo para clientes) */}
				{isCustomer && business && (
					<HStack space="md" className="items-center justify-between px-2">
						<Heading size="lg" className="text-primary-500 flex-1">
							{business.name}
						</Heading>
						<VStack space="xs" className="items-end">
							<Text className="text-typography-500 text-xs">
								Tus puntos actuales
							</Text>
							<Badge action="info" variant="solid" size="lg">
								<BadgeText>{currentPoints} puntos</BadgeText>
							</Badge>
						</VStack>
					</HStack>
				)}
				{/* Imagen de la recompensa */}
				<Box className="w-full aspect-square bg-background-100 rounded-lg overflow-hidden">
					{reward.imageUrl ? (
						<Image
							source={{ uri: reward.imageUrl }}
							alt={reward.name}
							className="w-full h-full"
						/>
					) : (
						<Box className="w-full h-full justify-center items-center">
							<Text className="text-typography-400">Sin imagen</Text>
						</Box>
					)}
				</Box>
				{/* Nombre de la recompensa */}
				<Heading size="xl" className="text-typography-900">
					{reward.name}
				</Heading>
				{/* Descripción */}
				<Text className="text-typography-700 leading-5">
					{reward.description || "Sin descripción disponible"}
				</Text>
				{/* Puntos requeridos */}
				<VStack space="xs">
					<Text className="text-typography-500 text-xs">
						Costo de la recompensa
					</Text>
					<Badge
						action="success"
						variant="solid"
						size="lg"
						className="self-start"
					>
						<BadgeText>{reward.pointsRequired} puntos</BadgeText>
					</Badge>
				</VStack>{" "}
				{/* Información de uso (solo para clientes) */}
				{isCustomer && (
					<Box className="border border-blue-200 bg-blue-50 rounded-lg p-4">
						<HStack space="sm" className="items-start">
							<Icon as={InfoIcon} size="md" className="text-info-800 mt-0.5" />
							<VStack space="xs" className="flex-1">
								<Text className="text-info-800 text-base leading-6">
									Válido por 5 días desde la fecha de canje. El canje generará
									un código QR único para presentar en caja. Sujeto a
									disponibilidad del local. Límite de 1 uso.
								</Text>
							</VStack>
						</HStack>
					</Box>
				)}
				{/* Mostrar error de eliminación (solo owner) */}
				{isOwner && deleteError && (
					<Box className="bg-red-50 p-3 rounded-lg">
						<Text className="text-error-500">{deleteError.message}</Text>
					</Box>
				)}
				{/* Botones según el rol */}
				{isCustomer ? (
					<>
						{/* Botón de canjear */}
						<Button
							onPress={handleRedeemPress}
							isDisabled={!canRedeem}
							size="lg"
							className="w-full rounded-lg"
						>
							<ButtonText className="font-medium">Canjear</ButtonText>
						</Button>

						{/* Mensaje si no tiene suficientes puntos */}
						{!canRedeem && (
							<Text className="text-typography-500 text-sm text-center">
								Te faltan {reward.pointsRequired - currentPoints} puntos para
								canjear esta recompensa
							</Text>
						)}
					</>
				) : isOwner ? (
					<VStack space="md" className="mt-5">
						{/* Botón editar */}
						<Button
							onPress={handleEditPress}
							variant="outline"
							size="lg"
							className="rounded-lg"
						>
							<Icon as={EditIcon} className="text-primary-500 mr-2" size="sm" />
							<ButtonText>Editar recompensa</ButtonText>
						</Button>

						{/* Botón eliminar */}
						<Button
							onPress={handleDeletePress}
							isDisabled={isDeleting}
							variant="outline"
							size="lg"
							className="rounded-lg border-error-500"
						>
							<ButtonText className="text-error-500">
								{isDeleting ? "Eliminando..." : "Eliminar recompensa"}
							</ButtonText>
						</Button>
					</VStack>
				) : null}
			</VStack>

			{/* Modal de confirmación de eliminación (solo para owner) */}
			{isOwner && showDeleteModal && (
				<Box className="absolute inset-0 bg-black/50 justify-center items-center p-6">
					<Box className="bg-background-0 rounded-lg p-6 w-full max-w-sm">
						<VStack space="lg">
							<Heading size="lg" className="text-typography-900">
								¿Eliminar esta recompensa?
							</Heading>

							<Text className="text-typography-700">
								La recompensa "{reward.name}" será desactivada y no se mostrará
								a los clientes.
							</Text>

							<HStack space="sm" className="justify-end">
								<Button
									variant="outline"
									onPress={() => setShowDeleteModal(false)}
									size="md"
								>
									<ButtonText>Cancelar</ButtonText>
								</Button>

								<Button
									onPress={handleConfirmDelete}
									action="negative"
									size="md"
								>
									<ButtonText>Eliminar</ButtonText>
								</Button>
							</HStack>
						</VStack>
					</Box>
				</Box>
			)}
		</AppLayout>
	);
}

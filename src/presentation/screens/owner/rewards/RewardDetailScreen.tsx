import { useRouter } from "expo-router";
import { AlertCircleIcon, EditIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Modal, useWindowDimensions } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseCircleIcon, Icon, TrashIcon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useReward } from "@/src/presentation/hooks/useReward";
import { useRewardDetail } from "@/src/presentation/hooks/useRewardDetail";

type RewardDetailScreenProps = {
	rewardId: string;
};

export default function RewardDetailScreen({
	rewardId,
}: RewardDetailScreenProps) {
	const router = useRouter();
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	// Hook para obtener dimensiones de la pantalla
	const { width } = useWindowDimensions();
	const isSmallScreen = width < 380; // Detectar pantallas pequeñas

	// Obtener businessId
	const { data: businessId } = useBusinessId();

	// Cargar datos de la recompensa
	const { data: reward, isLoading, error } = useRewardDetail(rewardId);

	// Hook de mutation para eliminar
	const { deleteReward, isDeleting, deleteSuccess, deleteError } =
		useReward(businessId);

	// Navegar cuando se elimine exitosamente
	useEffect(() => {
		if (deleteSuccess) {
			Alert.alert("Éxito", "Recompensa desactivada correctamente", [
				{ text: "OK", onPress: () => router.back() },
			]);
		}
	}, [deleteSuccess, router]);

	const handleEditPress = () => {
		router.push(`/(owner)/rewards/edit/${rewardId}` as never);
	};

	const handleDeletePress = () => {
		setShowDeleteModal(true);
	};

	const confirmDelete = () => {
		setShowDeleteModal(false);
		deleteReward(rewardId);
	};

	if (isLoading) {
		return <FeedbackScreen variant="loading" title="Cargando recompensa..." />;
	}

	if (error || !reward) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Recompensa no encontrada"
				description={error?.message || "No se encontró la recompensa"}
			/>
		);
	}

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
			headerTitle="Detalle de recompensa"
		>
			{/* Imagen de la recompensa */}
			<Box className="w-full aspect-square bg-background-100 overflow-hidden">
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

			{/* Información de la recompensa */}
			<Heading size="xl" className="text-primary-500 pt-4">
				{reward.name}
			</Heading>

			<Text className="text-typography-700">
				{reward.description || "Sin descripción disponible"}
			</Text>

			<Box className="bg-primary-500 self-start px-6 py-2 rounded-full">
				<Text size="sm" className="text-typography-0">
					{reward.pointsRequired} puntos
				</Text>
			</Box>

			{/* Mostrar error de eliminación */}
			{deleteError && (
				<Box className="bg-red-50 p-3 rounded-lg">
					<Text className="text-error-500">{deleteError.message}</Text>
				</Box>
			)}

			{/* Botones de acción */}
			<VStack space="md" className="mt-5">
				{/* Botón Editar */}
				<Button
					onPress={handleEditPress}
					variant="outline"
					size="lg"
					className="rounded-lg"
				>
					<Icon as={EditIcon} className="text-primary-500 mr-2" size="sm" />
					<ButtonText>Editar recompensa</ButtonText>
				</Button>

				{/* Botón Eliminar */}
				<Button
					onPress={handleDeletePress}
					isDisabled={isDeleting}
					variant="outline"
					size="lg"
					className="rounded-lg border-error-500"
				>
					{isDeleting ? (
						<ButtonSpinner color="#F44336" />
					) : (
						<>
							<Icon
								as={CloseCircleIcon}
								className="text-error-500 mr-2"
								size="sm"
							/>
							<ButtonText className="text-error-500">
								Eliminar recompensa
							</ButtonText>
						</>
					)}
				</Button>
			</VStack>

			{/* Modal de Confirmación */}
			<Modal
				visible={showDeleteModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowDeleteModal(false)}
			>
				<Box className="flex-1 justify-center items-center bg-black/50 p-6">
					<Box className="bg-background-0 rounded-lg p-6 w-full max-w-sm">
						<VStack space="xl">
							<Heading size="lg" className="text-primary-500">
								¿Estás seguro de querer eliminar esta recompensa?
							</Heading>

							<Text className="text-typography-500">
								La recompensa será eliminada y no se mostrará a los clientes.
								Por favor confirme si desea continuar.
							</Text>

							{/* Botones en horizontal */}
							<HStack space="sm" className="mt-3 justify-end">
								{/* Botón Cancelar */}
								<Button
									variant="outline"
									onPress={() => setShowDeleteModal(false)}
									size="md"
									className="flex-2"
								>
									{isSmallScreen ? (
										<Icon
											as={CloseCircleIcon}
											className="text-primary-500"
											size="sm"
										/>
									) : (
										<HStack space="sm" className="items-center">
											<ButtonText size="sm" className="font-bold">
												Cancelar
											</ButtonText>
											<Icon
												as={CloseCircleIcon}
												className="text-primary-500"
												size="sm"
											/>
										</HStack>
									)}
								</Button>

								{/* Botón Eliminar */}
								<Button
									onPress={confirmDelete}
									action="negative"
									size="md"
									className="flex-2"
								>
									{isSmallScreen ? (
										<Icon
											as={TrashIcon}
											className="text-typography-0"
											size="sm"
										/>
									) : (
										<HStack space="sm" className="items-center">
											<ButtonText size="sm" className="font-bold">
												Eliminar
											</ButtonText>
											<Icon
												as={TrashIcon}
												className="text-typography-0"
												size="sm"
											/>
										</HStack>
									)}
								</Button>
							</HStack>
						</VStack>
					</Box>
				</Box>
			</Modal>
		</AppLayout>
	);
}

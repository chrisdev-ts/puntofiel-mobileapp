import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Image } from "@/components/ui/image";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { Promotion } from "@/src/core/entities/Promotion";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useDeletePromotion } from "@/src/presentation/hooks/useDeletePromotion";
import { usePromotion } from "@/src/presentation/hooks/usePromotion";
import { useUpdatePromotion } from "@/src/presentation/hooks/useUpdatePromotion";

export default function DetailPromotionScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	// Se evita el non-null assertion, se maneja undefined
	const { data: promotion, isLoading, refetch } = usePromotion(id ?? "");
	const { mutate: updatePromotion } = useUpdatePromotion();
	const { mutate: deletePromotion, isPending: isDeleting } =
		useDeletePromotion();
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	if (isLoading) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Detalles de la promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Spinner />
				</View>
			</AppLayout>
		);
	}

	// ✅ Validar tipo y casting
	if (!promotion || Array.isArray(promotion)) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Detalles de la promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Text>Promoción no encontrada</Text>
				</View>
			</AppLayout>
		);
	}

	const promotionData = promotion as Promotion;

	// ✅ Validar endDate después del casting
	if (!promotionData.endDate) {
		return (
			<AppLayout
				headerVariant="back"
				headerTitle="Detalles de la promoción"
				showNavBar={false}
			>
				<View className="flex-1 justify-center items-center">
					<Text>Fecha de finalización inválida</Text>
				</View>
			</AppLayout>
		);
	}

	// Calcular días restantes
	const endDate = new Date(promotionData.endDate);
	const daysRemaining = Math.ceil(
		(endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
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
						"Éxito",
						`La promoción se ${newStatus ? "activó" : "desactivó"}`,
					);
					// 🔄 Recargar datos después de actualizar
					setTimeout(() => {
						refetch?.();
					}, 500);
				},
				onError: (error: unknown) => {
					let message = "Error al actualizar";
					if (
						error &&
						typeof error === "object" &&
						"message" in error &&
						typeof (error as Record<string, unknown>).message === "string"
					) {
						message = (error as Record<string, unknown>).message as string;
					}
					Alert.alert("Error", message);
				},
			},
		);
	};

	// Manejar eliminación
	const handleDelete = () => {
		if (isDeleting) return;
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (isDeleting) return;
		try {
			await deletePromotion(
				{
					id: promotionData.id,
					businessId: promotionData.businessId,
					imageUrl: promotionData.imageUrl ?? undefined,
				},
				{
					onSuccess: () => {
						setShowDeleteModal(false);
						router.push("/(owner)/promotions");
					},
					onError: (error: unknown) => {
						let message = "Error al eliminar";
						if (
							error &&
							typeof error === "object" &&
							"message" in error &&
							typeof (error as Record<string, unknown>).message === "string"
						) {
							message = (error as Record<string, unknown>).message as string;
						}
						setShowDeleteModal(false);
						Alert.alert("Error", message);
					},
				},
			);
		} catch {
			setShowDeleteModal(false);
			Alert.alert("Error", "No se pudo eliminar la promoción");
		}
	};

	// Manejar edición
	const handleEdit = () => {
		router.push({
			pathname: "/(owner)/promotions/edit/[id]",
			params: { id: promotionData.id },
		});
	};

	return (
		<AppLayout
			headerVariant="back"
			headerTitle="Detalles de la promoción"
			showNavBar={false}
		>
			{/* Imagen de la promoción (igual que recompensas) */}
			<View className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
				{promotionData.imageUrl ? (
					<Image
						source={{ uri: promotionData.imageUrl }}
						alt={promotionData.title}
						className="w-full h-full"
						resizeMode="cover"
					/>
				) : (
					<View className="w-full h-full justify-center items-center">
						<Text className="text-gray-400">Sin imagen</Text>
					</View>
				)}
			</View>

			{/* Tarjeta de información */}
			<Card className="p-4 bg-gray-50 rounded-lg border border-gray-200">
				<VStack className="gap-3">
					<Text className="text-2xl font-bold text-gray-900">
						{promotionData.title}
					</Text>
					<Text className="text-base text-gray-600 leading-6">
						{promotionData.content}
					</Text>

					{/* Badge de estado */}
					<HStack className="gap-3">
						<Badge
							className={
								promotionData.isActive
									? "bg-green-100 rounded-full"
									: "bg-red-100 rounded-full"
							}
						>
							<BadgeText
								className={
									promotionData.isActive
										? "text-green-700 text-sm font-semibold"
										: "text-red-700 text-sm font-semibold"
								}
							>
								{promotionData.isActive ? "Activada" : "Desactivada"}
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
			<VStack className="gap-3">
				{/* Botón de activar/desactivar */}
				<Button
					onPress={handleToggleStatus}
					className="w-full"
					variant="solid"
					action={promotionData.isActive ? "error" : "success"}
				>
					<ButtonText>
						{promotionData.isActive ? "Desactivar" : "Activar"}
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
					className={`w-full ${isDeleting ? "opacity-50" : ""}`}
					variant="solid"
					action="error"
					isDisabled={isDeleting}
				>
					<ButtonText>
						{isDeleting ? "Eliminando..." : "Eliminar promoción"}
					</ButtonText>
				</Button>
				{/* Modal de confirmación de eliminación */}
				<Modal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
				>
					<ModalBackdrop />
					<ModalContent>
						<ModalHeader>
							<Text className="text-lg font-bold">¿Eliminar promoción?</Text>
						</ModalHeader>
						<ModalBody>
							<Text>
								La promoción "{promotionData.title}" dejará de estar visible y
								no podrá recuperarse.
							</Text>
						</ModalBody>
						<ModalFooter>
							<Button
								variant="outline"
								onPress={() => setShowDeleteModal(false)}
								className="mr-2"
							>
								<ButtonText>Cancelar</ButtonText>
							</Button>
							<Button
								className="bg-red-600"
								onPress={confirmDelete}
								isDisabled={isDeleting}
							>
								<ButtonText className="text-white">
									{isDeleting ? "Eliminando..." : "Eliminar"}
								</ButtonText>
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>

				{/* Botón para volver al Home */}
				<Button
					onPress={() => router.push("/(owner)/(tabs)/home")}
					className="w-full"
					variant="outline"
				>
					<ButtonText>Volver al inicio</ButtonText>
				</Button>
			</VStack>
		</AppLayout>
	);
}

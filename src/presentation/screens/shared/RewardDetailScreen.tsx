import { useLocalSearchParams, useRouter } from "expo-router";
import {
	AlertCircleIcon,
	EditIcon,
	InfoIcon,
	TrashIcon,
} from "lucide-react-native";
import { useEffect, useState } from "react";

// UI Components
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

// Shared & Layout
import {
	FeedbackScreen,
	RewardDetailSkeleton,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

// Hooks
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useReward } from "@/src/presentation/hooks/useReward";
import { useRewardDetail } from "@/src/presentation/hooks/useRewardDetail";

export default function RewardDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { user } = useAuth();
	const toast = useToast();

	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const isOwner = user?.role === "owner";
	const isCustomer = user?.role === "customer";

	const { data: reward, isLoading: loadingReward, error } = useRewardDetail(id);
	const { data: ownBusinessId } = useBusinessId();

	const businessId = reward?.businessId || "";
	const shouldLoadBusiness = isCustomer && !!businessId;
	const { data: businessDetail, isLoading: loadingBusiness } =
		useBusinessDetail(shouldLoadBusiness ? businessId : "");

	const { deleteReward, isDeleting, deleteSuccess, deleteError } =
		useReward(ownBusinessId);

	const isLoading = loadingReward || (isCustomer && loadingBusiness);

	useEffect(() => {
		if (deleteSuccess) {
			toast.show({
				placement: "top",
				render: ({ id }) => (
					<Toast nativeID={`toast-${id}`} action="success" variant="solid">
						<ToastTitle>Éxito</ToastTitle>
						<ToastDescription>Recompensa eliminada.</ToastDescription>
					</Toast>
				),
			});
			setTimeout(() => router.back(), 500);
		}
	}, [deleteSuccess, router, toast]);

	if (isLoading) {
		return (
			<AppLayout showHeader={true} showNavBar={false} headerVariant="back">
				<Box className="flex-1 justify-center items-center bg-white">
					<RewardDetailSkeleton />
				</Box>
			</AppLayout>
		);
	}

	if (error || !reward) {
		return (
			<AppLayout showHeader={true} showNavBar={false} headerVariant="back">
				<FeedbackScreen
					variant="error"
					icon={AlertCircleIcon}
					title="Error"
					description="No se encontró la recompensa."
				/>
			</AppLayout>
		);
	}

	const { business, loyaltyCard } = businessDetail || {};
	const currentPoints = loyaltyCard?.points || 0;
	const canRedeem = currentPoints >= reward.pointsRequired;

	// --- HANDLERS ---

	const handleRedeemPress = () => {
		// 👇 CAMBIO: Ya no cobramos aquí. Solo validamos y navegamos.
		if (!canRedeem) return;
		router.push(`/(customer)/business/rewards/redeem?id=${reward.id}` as never);
	};

	const handleDelete = () => {
		if (ownBusinessId) {
			deleteReward(id);
			setShowDeleteModal(false);
		}
	};

	const handleEditPress = () => {
		router.push(`/(owner)/rewards/edit/${reward.id}` as never);
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
			headerTitle="Detalle de recompensa"
		>
			<VStack space="lg" className="pb-6 px-1">
				{isCustomer && business && (
					<HStack space="md" className="items-center justify-between px-2 mb-2">
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

				<Box className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
					{reward.imageUrl ? (
						<Image
							source={{ uri: reward.imageUrl }}
							alt={reward.name}
							className="w-full h-full"
							resizeMode="cover"
						/>
					) : (
						<Box className="w-full h-full justify-center items-center">
							<Text className="text-gray-400">Sin imagen</Text>
						</Box>
					)}
				</Box>

				<Heading size="xl" className="text-[#2F4858]">
					{reward.name}
				</Heading>
				<Text className="text-gray-700 leading-6">
					{reward.description || "Sin descripción disponible"}
				</Text>

				<VStack space="xs">
					<Text className="text-gray-500 text-xs">Costo de la recompensa</Text>
					<Badge
						action="success"
						variant="solid"
						size="lg"
						className="self-start"
					>
						<BadgeText>{reward.pointsRequired} puntos</BadgeText>
					</Badge>
				</VStack>

				{/* --- VISTA CLIENTE --- */}
				{isCustomer && (
					<Box className="mt-4">
						<Box className="border border-blue-200 bg-blue-50 rounded-lg p-4 mb-6">
							<HStack space="sm" className="items-start">
								<Icon
									as={InfoIcon}
									size="md"
									className="text-info-800 mt-0.5"
								/>
								{/* 👇 TEXTO ACTUALIZADO 👇 */}
								<Text className="text-info-800 text-sm flex-1">
									El cobro de los puntos se realizará automáticamente una vez
									que el código QR sea escaneado por el personal del negocio.
								</Text>
							</HStack>
						</Box>

						<Button
							onPress={handleRedeemPress}
							isDisabled={!canRedeem}
							size="lg"
							className={`w-full rounded-lg ${!canRedeem ? "opacity-50" : ""}`}
							action={canRedeem ? "primary" : "secondary"}
						>
							<ButtonText className="font-medium">Canjear</ButtonText>
						</Button>

						{!canRedeem && (
							<Text className="text-gray-500 text-sm text-center mt-2">
								Te faltan {reward.pointsRequired - currentPoints} puntos para
								canjear.
							</Text>
						)}
					</Box>
				)}

				{/* --- VISTA DUEÑO --- */}
				{isOwner && (
					<VStack space="md" className="mt-5">
						<Button
							variant="outline"
							className="rounded-lg border-[#2F4858]"
							size="lg"
							onPress={handleEditPress}
						>
							<Icon as={EditIcon} className="text-primary-500 mr-2" size="sm" />
							<ButtonText className="text-primary-500">
								Editar recompensa
							</ButtonText>
						</Button>

						<Button
							variant="outline"
							className="rounded-lg border-red-500"
							size="lg"
							onPress={() => setShowDeleteModal(true)}
							isDisabled={isDeleting}
						>
							<Icon as={TrashIcon} className="text-red-500 mr-2" />
							<ButtonText className="text-red-500">
								{isDeleting ? "Eliminando..." : "Eliminar recompensa"}
							</ButtonText>
						</Button>
					</VStack>
				)}

				{isOwner && deleteError && (
					<Box className="bg-red-50 p-3 rounded-lg mt-2">
						<Text className="text-error-500">{deleteError.message}</Text>
					</Box>
				)}
			</VStack>

			{isOwner && (
				<Modal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
				>
					<ModalBackdrop />
					<ModalContent>
						<ModalHeader>
							<Heading size="lg">¿Eliminar recompensa?</Heading>
						</ModalHeader>
						<ModalBody>
							<Text>
								La recompensa "{reward.name}" dejará de estar visible.
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
							<Button className="bg-red-600" onPress={handleDelete}>
								<ButtonText className="text-white">Eliminar</ButtonText>
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			)}
		</AppLayout>
	);
}

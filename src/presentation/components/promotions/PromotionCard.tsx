import { useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	Image as RNImage,
	View,
} from "react-native";

import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { Promotion } from "@/src/core/entities/Promotion";

interface PromotionCardProps {
	promotion: Promotion & { businessName?: string };
	onPress: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	showBusinessName?: boolean;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
	promotion,
	onPress,
	onEdit,
	onDelete,
	showBusinessName = false,
}) => {
	const [imageLoading, setImageLoading] = useState(true);
	const [imageError, setImageError] = useState(false);

	const startDate = new Date(promotion.startDate);
	const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
	const now = new Date();

	// Determinar estado de la promoción
	const isExpired = endDate && endDate < now;
	const isUpcoming = startDate > now;
	// const isActive = !isExpired && !isUpcoming;

	const getStatusColor = () => {
		if (isExpired) return "bg-red-100";
		if (isUpcoming) return "bg-yellow-100";
		return "bg-green-100";
	};

	const getStatusTextColor = () => {
		if (isExpired) return "text-red-600";
		if (isUpcoming) return "text-yellow-600";
		return "text-green-600";
	};

	const getStatusLabel = () => {
		if (isExpired) return "Expirada";
		if (isUpcoming) return "Próxima";
		return "Activa";
	};

	const handleImageLoadStart = () => {
		setImageLoading(true);
		setImageError(false);
	};

	const handleImageLoadEnd = () => {
		setImageLoading(false);
	};

	const handleImageError = (_error: unknown) => {
		console.error("[PromotionCard] 🖼️ Error cargando imagen:", {
			imageUrl: promotion.imageUrl,
			errorCode: error?.code,
			errorMessage: error?.message,
		});
		setImageError(true);
		setImageLoading(false);
	};

	return (
		<Pressable onPress={onPress} className="mb-4">
			<Card className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
				{/* Imagen de la promoción */}
				{promotion.imageUrl && !imageError ? (
					<View className="w-full h-48 bg-gray-200 overflow-hidden relative">
						{imageLoading && (
							<View className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
								<ActivityIndicator size="large" color="#3b82f6" />
							</View>
						)}

						<RNImage
							source={{ uri: promotion.imageUrl }}
							className="w-full h-full"
							resizeMode="cover"
							onLoadStart={handleImageLoadStart}
							onLoadEnd={handleImageLoadEnd}
							onError={handleImageError}
						/>
					</View>
				) : (
					<View className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
						<VStack className="gap-2 items-center">
							<Text className="text-blue-600 text-lg font-semibold">🖼️</Text>
							<Text className="text-blue-600 text-sm font-medium">
								Sin imagen
							</Text>
						</VStack>
					</View>
				)}

				{/* Contenido */}
				<VStack className="p-4 gap-3">
					{/* Nombre del negocio (opcional) */}
					{showBusinessName && promotion.businessName && (
						<Text className="text-xs text-typography-500 font-medium">
							{promotion.businessName}
						</Text>
					)}

					{/* Encabezado con título y estado */}
					<HStack className="justify-between items-start gap-2">
						<VStack className="flex-1 gap-1">
							<Heading className="text-lg font-bold text-gray-800 pr-2">
								{promotion.title}
							</Heading>
							<Badge
								className={`${getStatusColor()} px-2 py-1 rounded self-start`}
							>
								<BadgeText
									className={`text-xs font-semibold ${getStatusTextColor()}`}
								>
									{getStatusLabel()}
								</BadgeText>
							</Badge>
						</VStack>
					</HStack>

					{/* Descripción */}
					<Text className="text-gray-600 text-sm" numberOfLines={2}>
						{promotion.content}
					</Text>

					{/* Fechas */}
					<VStack className="gap-1 bg-gray-50 p-3 rounded">
						<HStack className="justify-between">
							<Text className="text-xs text-gray-500">Inicia:</Text>
							<Text className="text-xs font-semibold text-gray-700">
								{startDate.toLocaleDateString("es-ES")}
							</Text>
						</HStack>
						{endDate && (
							<HStack className="justify-between">
								<Text className="text-xs text-gray-500">Finaliza:</Text>
								<Text className="text-xs font-semibold text-gray-700">
									{endDate.toLocaleDateString("es-ES")}
								</Text>
							</HStack>
						)}
					</VStack>

					{/* Botones de acción (opcional) */}
					{(onEdit || onDelete) && (
						<HStack className="gap-2 mt-2">
							{onEdit && (
								<Button
									onPress={onEdit}
									className="flex-1"
									variant="solid"
									action="primary"
								>
									<ButtonText>Editar</ButtonText>
								</Button>
							)}
							{onDelete && (
								<Button
									onPress={onDelete}
									className="flex-1"
									variant="solid"
									action="error"
								>
									<ButtonText>Eliminar</ButtonText>
								</Button>
							)}
						</HStack>
					)}
				</VStack>
			</Card>
		</Pressable>
	);
};

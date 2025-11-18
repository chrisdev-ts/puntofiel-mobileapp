import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useRef } from "react";
import { Alert } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot, { captureRef } from "react-native-view-shot";

// UI Imports
import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Spinner } from "@gluestack-ui/themed";
import { Image as ImageIcon, MapPinIcon, ShareIcon, WalletIcon } from "lucide-react-native";

// Hooks & Layout
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useBusinessDetail } from "@/src/presentation/hooks/useBusinessDetail";
import { useRewardDetail } from "@/src/presentation/hooks/useRewardDetail";

export default function RedeemRewardScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const viewShotRef = useRef(null);
	const { user } = useAuth();

	const { data: reward, isLoading: loadingReward } = useRewardDetail(id);
	const { data: businessDetail, isLoading: loadingBusiness } = useBusinessDetail(reward?.businessId || "");

	// Función para capturar y compartir
	const handleShare = async () => {
		try {
			if (viewShotRef.current) {
				const uri = await captureRef(viewShotRef.current, {
					format: "png", quality: 0.8, result: "tmpfile"
				});
				if (await Sharing.isAvailableAsync()) {
					await Sharing.shareAsync(uri);
				} else {
					Alert.alert("Error", "Compartir no disponible");
				}
			}
		} catch (error) {
			console.error("Error al capturar:", error);
			Alert.alert("Error", "No se pudo guardar la imagen");
		}
	};

	const handleExit = () => {
		router.replace("/(customer)/(tabs)/home");
	};

	if (loadingReward || loadingBusiness) return <Box className="flex-1 center bg-white"><Spinner size="large" color="#2F4858" /></Box>;
	if (!reward || !businessDetail) return null;

	const { business, loyaltyCard } = businessDetail;
	const currentPoints = loyaltyCard?.points || 0;

	// Datos para el QR
	const qrValue = useMemo(() => {
		if (!user || !reward) return "";
		return JSON.stringify({
			type: 'reward_redemption',
			userId: user.id,
			rewardId: reward.id,
			pointsCost: reward.pointsRequired,
			timestamp: new Date().toISOString()
		});
	}, [user?.id, reward?.id]);

	return (
		<AppLayout showHeader={false} showNavBar={false} scrollable={true} backgroundColor="bg-white">
			<VStack space="lg" className="pb-10 pt-4 px-2">

				<ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: 'white' }}>

					{/* Header del Ticket */}
					<Box className="border border-gray-200 rounded-xl p-4 mb-6 bg-white shadow-sm">
						<HStack space="md" className="items-center">
							<Box className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
								{reward.imageUrl ? <Image source={{ uri: reward.imageUrl }} alt="Reward" className="w-full h-full" /> : <Box className="w-full h-full justify-center items-center"><Icon as={ImageIcon} size="lg" className="text-gray-300" /></Box>}
							</Box>
							<VStack className="flex-1">
								<Heading size="md" className="text-[#2F4858]" numberOfLines={1}>{reward.name}</Heading>
								<Text className="text-gray-500 mb-1">{business?.name}</Text>
								<Badge action="info" variant="solid" className="self-start rounded-md bg-[#2F4858]">
									<BadgeText className="text-white">{reward.pointsRequired} puntos</BadgeText>
								</Badge>
							</VStack>
						</HStack>
					</Box>

					{/* Código QR Gigante */}
					<Box className="items-center mb-8">
						<QRCode value={qrValue} size={250} color="#2F4858" logoBackgroundColor='transparent' />
					</Box>

					{/* Detalles Inferiores */}
					<Box className="border border-gray-200 rounded-xl p-4 mb-4 bg-white">
						<HStack space="md" className="items-center mb-4 border-b border-gray-100 pb-4">
							<Box className="p-2 bg-gray-100 rounded-full"><Icon as={WalletIcon} size="md" className="text-[#2F4858]" /></Box>
							<VStack className="flex-1">
								<Text className="font-bold text-[#2F4858]">Saldo actual</Text>
								<Text className="text-gray-500 text-xs">{currentPoints} puntos disponibles</Text>
							</VStack>
							<Badge className="bg-gray-600 rounded-full px-2">
								<BadgeText className="text-white text-xs">Cobro al escanear</BadgeText>
							</Badge>
						</HStack>

						<HStack space="md" className="items-center">
							<Box className="p-2 bg-gray-100 rounded-full"><Icon as={MapPinIcon} size="md" className="text-[#2F4858]" /></Box>
							<VStack className="flex-1">
								<Text className="font-bold text-[#2F4858]">Canjear en</Text>
								<Text className="text-gray-500 text-xs" numberOfLines={2}>{business?.name} - {business?.locationAddress || "Dirección no disponible"}</Text>
							</VStack>
						</HStack>
					</Box>
				</ViewShot>

				<VStack space="md">
					<Button className="bg-[#2F4858] rounded-lg h-12" onPress={handleShare}>
						<ButtonIcon as={ShareIcon} className="mr-2 text-white" />
						<ButtonText>Guardar / Compartir</ButtonText>
					</Button>
					<Button variant="outline" className="border-gray-300 rounded-lg h-12" onPress={handleExit}>
						<ButtonText className="text-gray-600">Salir</ButtonText>
					</Button>
				</VStack>

			</VStack>
		</AppLayout>
	);
}
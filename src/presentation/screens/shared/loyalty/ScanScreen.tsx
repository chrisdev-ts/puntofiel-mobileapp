import {
	type BarcodeScanningResult,
	CameraView,
	useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { Zap } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

export default function ScanScreen() {
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
	const [flashEnabled, setFlashEnabled] = useState(false);
	const cameraRef = useRef(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!permission) {
			requestPermission();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [permission, requestPermission]);

	const handleBarCodeScanned = (result: BarcodeScanningResult) => {
		if (scanned) return;
		setScanned(true);
		setError(null);
		// El QR del negocio contiene el businessId
		const businessId = result.data;
		if (!businessId || businessId.length < 10) {
			setError("QR inválido");
			setScanned(false);
			return;
		}
		navigateToBusinessDetail(businessId);
	};

	// Función auxiliar para navegar al detalle del negocio
	const navigateToBusinessDetail = (businessId: string) => {
		router.push(`/(customer)/business/${businessId}` as never);
	};

	if (!permission?.granted) {
		return (
			<AppLayout headerVariant="default" centerContent>
				<VStack space="lg" className="flex-1 items-center justify-center px-8">
					<Text className="text-center text-typography-700 text-lg">
						Se requiere permiso de cámara para escanear códigos QR
					</Text>
					<Button onPress={requestPermission} size="lg" action="primary">
						<ButtonText>Permitir cámara</ButtonText>
					</Button>
				</VStack>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			headerVariant="default"
			showNavBar={true}
			scrollable={false}
			centerContent
		>
			{/* Texto instructivo arriba */}
			<VStack space="sm" className="items-center">
				<Text className="text-center text-typography-900 text-xl font-semibold">
					Escanear código QR
				</Text>
				<Text className="text-center text-typography-500">
					Apunta la cámara hacia el código QR
				</Text>
			</VStack>

			{/* Área de escaneo - Centro */}
			<Box className="items-center justify-center">
				{/* Marco del escáner */}
				<Box className="relative w-full aspect-square max-w-md">
					{/* Esquinas decorativas */}
					<Box className="absolute top-0 left-0 w-12 h-12 border-t-[6px] border-l-[6px] border-primary-600 rounded-tl-2xl z-10" />
					<Box className="absolute top-0 right-0 w-12 h-12 border-t-[6px] border-r-[6px] border-primary-600 rounded-tr-2xl z-10" />
					<Box className="absolute bottom-0 left-0 w-12 h-12 border-b-[6px] border-l-[6px] border-primary-600 rounded-bl-2xl z-10" />
					<Box className="absolute bottom-0 right-0 w-12 h-12 border-b-[6px] border-r-[6px] border-primary-600 rounded-br-2xl z-10" />

					{/* Cámara */}
					<Box className="w-full h-full overflow-hidden rounded-2xl bg-black">
						<CameraView
							ref={cameraRef}
							style={{ width: "100%", height: "100%" }}
							barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
							onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
							enableTorch={flashEnabled}
						/>
					</Box>

					{/* Línea de escaneo */}
					{!scanned && (
						<Box className="absolute inset-0 items-center justify-center pointer-events-none">
							<Box className="w-3/4 h-1 bg-primary-500 opacity-70 shadow-lg" />
						</Box>
					)}
				</Box>
			</Box>

			{/* Controles y mensajes abajo */}
			{/* Mensaje de ayuda */}
			<Text className="text-center text-typography-500 px-4">
				Coloca el código QR dentro del marco para escanearlo
			</Text>

			{/* Mensaje de error */}
			{error && (
				<Text className="text-error-500 text-center font-semibold">
					{error}
				</Text>
			)}

			{/* Botón de reescanear */}
			{scanned && (
				<Button
					onPress={() => setScanned(false)}
					size="lg"
					action="primary"
					className="w-full max-w-xs"
				>
					<ButtonText>Escanear otro código</ButtonText>
				</Button>
			)}

			{/* Botón de flash */}
			<Button
				size="md"
				variant={flashEnabled ? "solid" : "outline"}
				action={flashEnabled ? "primary" : "secondary"}
				className="min-w-[140px]"
				onPress={() => setFlashEnabled(!flashEnabled)}
			>
				<Icon
					as={Zap}
					className={flashEnabled ? "text-white" : "text-gray-600"}
					size="sm"
				/>
				<ButtonText
					className={`ml-2 ${flashEnabled ? "text-white" : "text-gray-600"}`}
				>
					{flashEnabled ? "Apagar flash" : "Encender flash"}
				</ButtonText>
			</Button>
		</AppLayout>
	);
}

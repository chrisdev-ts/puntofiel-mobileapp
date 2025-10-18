import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
	type BarcodeScanningResult,
	CameraView,
	useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

export function ScanScreen() {
	const [permission, requestPermission] = useCameraPermissions();
	const [scanned, setScanned] = useState(false);
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
		// Suponemos que el QR contiene el customerId en formato UUID
		const customerId = result.data;
		if (!customerId || customerId.length < 10) {
			setError("QR inválido");
			setScanned(false);
			return;
		}
		navigateToRegisterLoyalty(customerId);
	};

	// Función auxiliar para navegar a la pantalla de registro de puntos
	const navigateToRegisterLoyalty = (customerId: string) => {
		const href = {
			pathname: "/business/loyalty/register",
			params: { customerId },
		} as const;
		router.push(href as never);
	};

	if (!permission?.granted) {
		return (
			<Box className="flex-1 items-center justify-center bg-white px-8">
				<Text>Se requiere permiso de cámara para escanear QR.</Text>
				<Button onPress={requestPermission} variant="solid" action="primary">
					<ButtonText>Permitir cámara</ButtonText>
				</Button>
			</Box>
		);
	}

	return (
		<Box className="flex-1 bg-black items-center justify-center">
			<CameraView
				ref={cameraRef}
				style={{ width: "100%", height: 400 }}
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
			/>
			<Box className="mt-6 items-center">
				<Text size="xl" className="text-white">
					Escanee el QR del cliente
				</Text>
				{error && <Text className="text-red-500 mt-2">{error}</Text>}
				{scanned && (
					<Button
						onPress={() => setScanned(false)}
						variant="outline"
						action="primary"
						className="mt-4"
					>
						<ButtonText>Escanear otro</ButtonText>
					</Button>
				)}
			</Box>
		</Box>
	);
}

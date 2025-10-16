import { router } from "expo-router";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export function WelcomeScreen() {
	return (
		<Box className="flex-1 items-center justify-center bg-white px-8">
			<VStack className="items-center gap-8 w-full">
				<Box className="items-center gap-4">
					<Image
						source={require("@/assets/logos/logo-vertical-dark.png")}
						alt="Logo de PuntoFiel"
						className="w-64 h-64"
						resizeMode="contain"
					/>
					<Text size="xl" className="text-center text-gray-600">
						Compra, acumula, caneja. Así de simple.
					</Text>
				</Box>

				{/* Botones de navegación */}
				<VStack className="w-full gap-4">
					<Button
						variant="solid"
						action="primary"
						onPress={() => router.push("/login")}
					>
						<ButtonText>Iniciar sesión</ButtonText>
					</Button>

					<Button
						variant="outline"
						action="primary"
						onPress={() => router.push("/register")}
					>
						<ButtonText>Crear cuenta</ButtonText>
					</Button>
				</VStack>
			</VStack>
		</Box>
	);
}

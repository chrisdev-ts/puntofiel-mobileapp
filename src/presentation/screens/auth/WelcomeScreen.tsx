import { router } from "expo-router";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout";

export default function WelcomeScreen() {
	return (
		<AppLayout
			showHeader={false}
			showNavBar={false}
			backgroundColor="bg-white"
			contentSpacing="xl"
			centerContent={true}
		>
			<Image
				source={require("@/assets/logos/logo-vertical-dark.png")}
				alt="Logo de PuntoFiel"
				className="w-64 h-64 self-center"
				resizeMode="contain"
			/>
			<Text size="xl" className="text-center text-gray-600">
				Compra, acumula, caneja. Así de simple.
			</Text>

			{/* Botones de navegación */}
			<VStack className="w-full gap-4">
				<Button
					variant="solid"
					action="primary"
					onPress={() => router.push("/(public)/login")}
				>
					<ButtonText>Iniciar sesión</ButtonText>
				</Button>

				<Button
					variant="outline"
					action="primary"
					onPress={() => router.push("/(public)/register")}
				>
					<ButtonText>Crear cuenta</ButtonText>
				</Button>
			</VStack>
		</AppLayout>
	);
}

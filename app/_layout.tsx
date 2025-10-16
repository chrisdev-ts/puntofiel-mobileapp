import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<GluestackUIProvider>
			<Stack>
				<Stack.Screen
					name="index"
					options={{
						headerShown: false,
						title: "Bienvenida",
					}}
				/>
				<Stack.Screen
					name="login"
					options={{
						headerShown: true,
						title: "Iniciar sesión",
						headerBackTitle: "Volver",
					}}
				/>
				<Stack.Screen
					name="register"
					options={{
						headerShown: true,
						title: "Crear cuenta",
						headerBackTitle: "Volver",
					}}
				/>
				<Stack.Screen
					name="business"
					options={{
						headerShown: false, // Ocultar el header del grupo para evitar duplicación
					}}
				/>
			</Stack>
		</GluestackUIProvider>
	);
}

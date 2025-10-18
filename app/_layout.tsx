import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { queryClient } from "@/src/infrastructure/config/queryClient";

export default function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
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
							headerShown: false,
						}}
					/>
				</Stack>
			</GluestackUIProvider>
		</QueryClientProvider>
	);
}

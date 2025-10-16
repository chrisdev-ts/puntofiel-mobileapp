import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<GluestackUIProvider>
			<Stack>
				<Stack.Screen
					name="scan"
					options={{
						headerShown: true,
						title: "Escanear código",
						headerBackTitle: "Volver",
					}}
				/>
				<Stack.Screen
					name="register-purchase"
					options={{
						headerShown: true,
						title: "Registrar compra",
						headerBackTitle: "Volver",
					}}
				/>
			</Stack>
		</GluestackUIProvider>
	);
}

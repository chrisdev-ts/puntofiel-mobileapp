import { Stack } from "expo-router";

export default function LoyaltyLayout() {
	return (
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
				name="register"
				options={{
					headerShown: true,
					title: "Registrar puntos",
					headerBackTitle: "Volver",
				}}
			/>
		</Stack>
	);
}

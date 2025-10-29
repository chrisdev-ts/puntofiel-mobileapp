import { Stack } from "expo-router";

export default function EmployeeLoyaltyLayout() {
	return (
		<Stack>
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

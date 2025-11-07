import { Stack } from "expo-router";

export default function EmployeeLoyaltyLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="register" />
		</Stack>
	);
}

import { Stack } from "expo-router";

export default function OwnerLoyaltyLayout() {
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

import { Stack } from "expo-router";

/**
 * Layout para las pantallas de tabs del propietario
 * No se usa Tabs nativo de Expo, sino NavBar personalizada
 */
export default function OwnerTabsLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="home" />
			<Stack.Screen name="rewards" />
			<Stack.Screen name="scan" />
			<Stack.Screen name="raffles" />
			<Stack.Screen name="profile" />
		</Stack>
	);
}

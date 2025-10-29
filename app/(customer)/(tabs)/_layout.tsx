import { Stack } from "expo-router";

/**
 * Layout para las pantallas de tabs del cliente
 * No se usa Tabs nativo de Expo, sino NavBar personalizada
 */
export default function CustomerTabsLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="home" />
			<Stack.Screen name="explore" />
			<Stack.Screen name="scan" />
			<Stack.Screen name="profile" />
		</Stack>
	);
}

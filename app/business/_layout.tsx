import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<GluestackUIProvider>
			<Stack>
				<Stack.Screen
					name="loyalty"
					options={{
						headerShown: false,
					}}
				/>
			</Stack>
		</GluestackUIProvider>
	);
}

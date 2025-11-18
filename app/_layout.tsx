import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "@/src/infrastructure/config/queryClient";
import { useAuthGuard } from "@/src/presentation/hooks/useAuthGuard";

function AppContent() {
	useAuthGuard();
	return <Slot />;
}

export default function RootLayout() {
	// Guard de autenticación - protege rutas según rol
	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<GluestackUIProvider>
					<AppContent />
				</GluestackUIProvider>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}

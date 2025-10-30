// Re-exportar la pantalla Login desde src/presentation/screens
//export { default } from "@/src/presentation/screens/auth/LoginScreen";

import { LoginScreen } from "@/src/presentation/screens/auth/LoginScreen";

export default function Login() {
	return <LoginScreen />;
}
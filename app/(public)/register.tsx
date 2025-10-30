// Re-exportar la pantalla Register desde src/presentation/screens
//export { default } from "@/src/presentation/screens/auth/RegisterScreen";

import { RegisterScreen } from "@/src/presentation/screens/auth/RegisterScreen";

export default function Register() {
	return <RegisterScreen />;
}

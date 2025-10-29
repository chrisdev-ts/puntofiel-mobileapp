import { Slot } from "expo-router";
import { AuthGuard } from "@/src/presentation/components/auth/AuthGuard";

export default function CustomerLayout() {
	return (
		<AuthGuard allowedRoles={["customer"]}>
			<Slot />
		</AuthGuard>
	);
}

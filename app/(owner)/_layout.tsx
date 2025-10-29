import { Slot } from "expo-router";
import { AuthGuard } from "@/src/presentation/components/auth/AuthGuard";

export default function OwnerLayout() {
	return (
		<AuthGuard allowedRoles={["owner"]}>
			<Slot />
		</AuthGuard>
	);
}

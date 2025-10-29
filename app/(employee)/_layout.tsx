import { Slot } from "expo-router";
import { AuthGuard } from "@/src/presentation/components/auth/AuthGuard";

export default function EmployeeLayout() {
	return (
		<AuthGuard allowedRoles={["employee"]}>
			<Slot />
		</AuthGuard>
	);
}

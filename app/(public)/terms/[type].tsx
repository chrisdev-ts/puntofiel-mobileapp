import { useLocalSearchParams } from "expo-router";
import { TermsScreen } from "@/src/presentation/screens/terms/TermsScreen";

export default function TermsRoute() {
	const { type } = useLocalSearchParams<{ type: "user" | "owner" }>();

	return <TermsScreen type={type || "user"} />;
}

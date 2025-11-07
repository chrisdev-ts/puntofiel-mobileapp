import { useLocalSearchParams } from "expo-router";
import EmployeeDetailScreen from "@/src/presentation/screens/owner/employees/EmployeeDetailScreen";

export default function EmployeeDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();

	if (!id) {
		return null;
	}

	return <EmployeeDetailScreen employeeId={id} />;
}

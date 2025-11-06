import EmployeeDetailScreen from "@/src/presentation/screens/owner/employees/EmployeeDetailScreen";
import { useLocalSearchParams } from "expo-router";

export default function EmployeeDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();

	if (!id) {
		return null;
	}

	return <EmployeeDetailScreen employeeId={id} />;
}

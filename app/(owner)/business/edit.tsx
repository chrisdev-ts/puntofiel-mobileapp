/*import { FeedbackScreen } from "@/src/presentation/components/common/FeedbackScreen";

export default function BusinessEditScreen() {
	return (
		<FeedbackScreen
			variant="empty"
			title="Editar Negocio"
			description="Esta pantalla está en desarrollo."
		/>
	);
}*/
import CreateBusinessFlow from "@/src/presentation/screens/owner/business/CreateBusinessFlow";
import { useLocalSearchParams } from "expo-router";

export default function EditBusinessScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return <CreateBusinessFlow isEditMode={true} businessId={id} />;
}

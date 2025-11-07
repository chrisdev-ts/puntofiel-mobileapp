import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { EmployeeActionModal } from "@/src/presentation/components/employees/EmployeeActionModal";
import { EmployeeForm } from "@/src/presentation/components/employees/EmployeeForm";
import type { EditEmployeeFormData } from "@/src/presentation/components/employees/EmployeeSchema";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useEmployee } from "@/src/presentation/hooks/useEmployee";
import { useEmployeeDetail } from "@/src/presentation/hooks/useEmployeeDetail";

/**
 * Pantalla para editar un empleado existente
 */
export default function EditEmployeeScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const employeeId = Number.parseInt(id, 10);

	const { data: businessId } = useBusinessId();
	const {
		data: employee,
		isLoading: loadingEmployee,
		error: employeeError,
	} = useEmployeeDetail(employeeId);
	const { updateEmployee, isUpdatingEmployee } = useEmployee(businessId);

	const [modalState, setModalState] = useState<{
		isOpen: boolean;
		variant: "success" | "error";
	}>({
		isOpen: false,
		variant: "success",
	});

	if (loadingEmployee) {
		return <FeedbackScreen variant="loading" title="Cargando empleado..." />;
	}

	if (employeeError || !employee) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Error al cargar empleado"
				description={employeeError?.message || "No se encontró el empleado"}
			/>
		);
	}

	const handleFormSubmit = async (data: EditEmployeeFormData) => {
		updateEmployee(
			{
				employeeId: employee.id,
				data: {
					firstName: data.firstName,
					lastName: data.lastName,
					secondLastName: data.secondLastName,
					email: data.email,
					password:
						data.password && data.password.length > 0
							? data.password
							: undefined,
				},
			},
			{
				onSuccess: () => {
					setModalState({
						isOpen: true,
						variant: "success",
					});
				},
				onError: (error) => {
					console.error("Error al actualizar empleado:", error);
					setModalState({
						isOpen: true,
						variant: "error",
					});
				},
			},
		);
	};

	const handleModalClose = () => {
		setModalState((prev) => ({ ...prev, isOpen: false }));

		if (modalState.variant === "success") {
			router.push(`/(owner)/employees/${employee.id}`);
		}
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerVariant="back"
		>
			<VStack space="lg" className="w-full">
				<Heading size="xl" className="text-primary-500">
					Editar cuenta de empleado
				</Heading>

				<Text className="text-typography-600">
					Actualiza la información del empleado. Deja la contraseña vacía si no
					deseas cambiarla.
				</Text>

				<EmployeeForm
					onSubmit={handleFormSubmit}
					isLoading={isUpdatingEmployee}
					mode="edit"
					initialData={{
						firstName: employee.profile.firstName,
						lastName: employee.profile.lastName || "",
						secondLastName: employee.profile.secondLastName || "",
						email: employee.profile.email,
						password: "",
						confirmPassword: "",
					}}
				/>
			</VStack>

			<EmployeeActionModal
				isOpen={modalState.isOpen}
				onClose={handleModalClose}
				variant={modalState.variant}
				mode="edit"
			/>
		</AppLayout>
	);
}

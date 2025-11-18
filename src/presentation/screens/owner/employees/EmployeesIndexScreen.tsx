import { useRouter } from "expo-router";
import { AlertCircleIcon, UserIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
	FeedbackScreen,
	ListContainer,
} from "@/src/presentation/components/common";
import { EmployeeListItem } from "@/src/presentation/components/employees";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useEmployee } from "@/src/presentation/hooks/useEmployee";

/**
 * Pantalla de lista de empleados del negocio
 */
export default function EmployeesIndexScreen() {
	const router = useRouter();

	// Obtener businessId del usuario autenticado
	const { data: businessId } = useBusinessId();

	// Obtener empleados del negocio
	const { employees, isLoadingEmployees, employeesError } =
		useEmployee(businessId);

	// Estado de carga
	if (isLoadingEmployees) {
		return <FeedbackScreen variant="loading" title="Cargando empleados..." />;
	}

	// Manejo de errores
	if (employeesError) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircleIcon}
				title="Error al cargar empleados"
				description={employeesError.message}
			/>
		);
	}

	// Construir nombre completo del empleado
	const getEmployeeName = (employee: (typeof employees)[0]) => {
		const parts = [
			employee.profile?.firstName,
			employee.profile?.lastName,
			employee.profile?.secondLastName,
		].filter(Boolean);

		return parts.length > 0 ? parts.join(" ") : "Sin nombre";
	};

	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			scrollable={true}
			headerTitle="Gestionar empleados"
			headerVariant="back"
		>
			<VStack space="lg" className="w-full">
				{/* Botón de crear empleado */}
				<Button
					onPress={() => router.push("/(owner)/employees/create")}
					action="primary"
					size="lg"
				>
					<ButtonText>Registrar empleado</ButtonText>
				</Button>

				{/* Encabezado */}
				<VStack space="sm">
					<Text className="text-typography-600">
						Gestiona las cuentas de tus empleados
					</Text>
				</VStack>

				{/* Lista de empleados o estado vacío */}
				{employees.length === 0 ? (
					<FeedbackScreen
						variant="empty"
						icon={UserIcon}
						title="No hay empleados registrados"
						description="Registra tu primer empleado para que pueda escanear códigos QR y otorgar puntos a tus clientes."
					/>
				) : (
					<ListContainer>
						{employees.map((employee) => (
							<EmployeeListItem
								key={employee.id}
								id={employee.id.toString()}
								title={getEmployeeName(employee)}
								subtitle="Puntos otorgados"
								onPress={(id) => router.push(`/(owner)/employees/${id}`)}
							/>
						))}
					</ListContainer>
				)}
			</VStack>
		</AppLayout>
	);
}

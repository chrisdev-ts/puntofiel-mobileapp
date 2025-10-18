import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlError,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { ErrorOverlay } from "@/src/presentation/components/feedback/ErrorOverlay";
import { SuccessOverlay } from "@/src/presentation/components/feedback/SuccessOverlay";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useCustomerProfile } from "@/src/presentation/hooks/useCustomerProfile";
import { useScan } from "@/src/presentation/hooks/useScan";
import {
	type RegisterLoyaltyFormValues,
	registerLoyaltySchema,
} from "@/src/presentation/screens/business/loyalty/RegisterLoyaltySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";

export function RegisterLoyaltyScreen() {
	const { customerId } = useLocalSearchParams<{ customerId: string }>();

	// Hooks de TanStack Query para obtener datos del servidor
	const {
		data: businessId,
		isLoading: loadingBusiness,
		error: businessError,
	} = useBusinessId();

	const {
		data: customerProfile,
		isLoading: fetchingCustomer,
		error: customerError,
	} = useCustomerProfile(customerId);

	// Hook de mutación para procesar el registro de puntos
	const { loading, success, error, process, reset } = useScan();

	// Configuración de React Hook Form con Zod
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterLoyaltyFormValues>({
		resolver: zodResolver(registerLoyaltySchema),
		defaultValues: {
			amount: "",
		},
	});

	// Función de submit - solo se ejecuta si la validación de Zod pasa
	const onSubmit = (data: RegisterLoyaltyFormValues) => {
		if (!businessId) {
			return;
		}

		const amount = Number(data.amount);

		process({
			customerId: customerId as string,
			businessId,
			amount,
		});
	};

	return (
		<Box className="flex-1 items-center justify-center bg-white px-8 gap-4 py-6">
			<Heading size="xl">Registrar compra</Heading>

			{loadingBusiness ? (
				<Text className="text-center">Cargando información del negocio...</Text>
			) : businessError || !businessId ? (
				<Box className="w-full bg-red-100 p-4 rounded-lg">
					<Text className="text-red-700 text-center font-bold">
						Error: No se encontró el negocio
					</Text>
					<Text className="text-red-600 text-center text-sm mt-2">
						{businessError?.message ||
							"Asegúrate de estar autenticado como dueño de negocio"}
					</Text>
				</Box>
			) : (
				<>
					{/* Información del cliente */}
					<Text className="text-center mb-2">
						{fetchingCustomer
							? "Cargando cliente..."
							: customerError
								? "Error al cargar cliente"
								: customerProfile?.isValid
									? `Cliente: ${customerProfile.fullName}`
									: "Cliente no encontrado o inválido"}
					</Text>

					{/* Formulario con React Hook Form */}
					<Box className="w-full flex flex-col gap-4">
						<FormControl isInvalid={!!errors.amount}>
							<FormControlLabel>
								<FormControlLabelText>Monto de la compra</FormControlLabelText>
							</FormControlLabel>

							<Controller
								control={control}
								name="amount"
								render={({ field: { onChange, onBlur, value } }) => (
									<Input>
										<InputField
											placeholder="Ingrese el monto"
											keyboardType="numeric"
											value={value}
											onChangeText={onChange}
											onBlur={onBlur}
										/>
									</Input>
								)}
							/>

							{errors.amount && (
								<FormControlError>
									<FormControlErrorText>
										{errors.amount.message}
									</FormControlErrorText>
								</FormControlError>
							)}
						</FormControl>

						<Button
							variant="solid"
							action="primary"
							isDisabled={loading || !customerProfile?.isValid}
							onPress={handleSubmit(onSubmit)}
						>
							<ButtonText>
								{loading ? "Procesando..." : "Confirmar y Otorgar Puntos"}
							</ButtonText>
						</Button>
					</Box>
				</>
			)}

			{/* Feedback visual con overlays */}
			<SuccessOverlay
				visible={!!success}
				message={success?.message || ""}
				newPointsBalance={success?.newPointsBalance}
				onClose={() => {
					reset();
					router.back();
				}}
			/>
			<ErrorOverlay visible={!!error} message={error || ""} onClose={reset} />
		</Box>
	);
}

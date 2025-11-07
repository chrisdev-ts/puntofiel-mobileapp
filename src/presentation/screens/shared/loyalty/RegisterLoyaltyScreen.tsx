import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, ButtonText } from "@/components/ui/button";
import {
	FormControl,
	FormControlError,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
	Toast,
	ToastDescription,
	ToastTitle,
	useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
	FeedbackScreen,
	RegisterLoyaltySkeleton,
} from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useCustomerProfile } from "@/src/presentation/hooks/useCustomerProfile";
import { useScan } from "@/src/presentation/hooks/useScan";
import {
	type RegisterLoyaltyFormValues,
	registerLoyaltySchema,
} from "@/src/presentation/screens/shared/loyalty/RegisterLoyaltySchema";

export default function RegisterLoyaltyScreen() {
	const { customerId } = useLocalSearchParams<{ customerId: string }>();
	const toast = useToast();

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
	const { loading, process, reset } = useScan();

	// Configuración de React Hook Form con Zod
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<RegisterLoyaltyFormValues>({
		resolver: zodResolver(registerLoyaltySchema),
		defaultValues: {
			amount: "",
			notes: "",
		},
	});

	// Calcular puntos en tiempo real (1% del monto)
	const amount = watch("amount");
	const pointsToEarn = useMemo(() => {
		const numAmount = Number(amount);
		if (Number.isNaN(numAmount) || numAmount <= 0) return 0;
		return Math.round(numAmount * 0.01);
	}, [amount]);

	// Función de submit - solo se ejecuta si la validación de Zod pasa
	const onSubmit = (data: RegisterLoyaltyFormValues) => {
		if (!businessId) {
			console.error("RegisterLoyaltyScreen: No businessId available");
			return;
		}

		const amountValue = Number(data.amount);

		process(
			{
				customerId: customerId as string,
				businessId,
				amount: amountValue,
				notes: data.notes,
			},
			{
				onSuccess: (result) => {
					toast.show({
						placement: "top",
						duration: 3000,
						render: ({ id }) => {
							const uniqueToastId = `toast-${id}`;
							return (
								<Toast
									nativeID={uniqueToastId}
									action="success"
									variant="solid"
								>
									<ToastTitle>{result.message}</ToastTitle>
									{result.newPointsBalance !== undefined && (
										<ToastDescription>
											Nuevo saldo: {result.newPointsBalance} puntos
										</ToastDescription>
									)}
								</Toast>
							);
						},
					});
					reset();
					router.back();
				},
				onError: (error) => {
					toast.show({
						placement: "top",
						duration: 4000,
						render: ({ id }) => {
							const uniqueToastId = `toast-${id}`;
							return (
								<Toast nativeID={uniqueToastId} action="error" variant="solid">
									<ToastTitle>Error al registrar puntos</ToastTitle>
									<ToastDescription>
										{error.message || "Intenta nuevamente"}
									</ToastDescription>
								</Toast>
							);
						},
					});
				},
			},
		);
	};

	// 1. Estado de Carga
	if (loadingBusiness || fetchingCustomer) {
		return (
			<AppLayout
				showHeader={true}
				headerVariant="default"
				showNavBar={false}
				scrollable={true}
			>
				<RegisterLoyaltySkeleton />
			</AppLayout>
		);
	}

	// 2. Estado de Error - Negocio no encontrado
	if (businessError || !businessId) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircle}
				title="Error al cargar negocio"
				description={
					businessError?.message ||
					"No se pudo obtener la información del negocio. Asegúrate de estar autenticado correctamente."
				}
			/>
		);
	}

	// 3. Estado de Error - Cliente no válido
	if (customerError || !customerProfile?.isValid) {
		return (
			<FeedbackScreen
				variant="error"
				icon={AlertCircle}
				title="Cliente no encontrado"
				description={
					customerError?.message ||
					"El cliente escaneado no existe o no es válido en el sistema."
				}
			/>
		);
	}

	// 4. Estado Principal - Formulario de registro
	return (
		<AppLayout
			showHeader={true}
			headerVariant="back"
			headerTitle="Registrar puntos"
			showNavBar={false}
			scrollable={true}
			centerContent
		>
			<VStack space="lg" className="w-full">
				{/* Nombre del cliente */}
				<VStack space="sm">
					<Text className="text-typography-500 text-sm text-center">
						Cliente
					</Text>
					<Text className="text-typography-900 text-xl font-bold text-center">
						{customerProfile.fullName}
					</Text>
				</VStack>

				{/* Ícono y descripción */}
				<VStack space="sm" className="items-center">
					<Text className="text-typography-600 text-sm max-w-sm text-center">
						Ingresa el monto total de la compra para asignarle los puntos
						correspondientes al cliente.
					</Text>
				</VStack>

				{/* Formulario con React Hook Form */}
				<VStack space="md" className="w-full py-4">
					{/* Campo de monto */}
					<FormControl isInvalid={!!errors.amount}>
						<FormControlLabel>
							<FormControlLabelText>Monto de la compra</FormControlLabelText>
						</FormControlLabel>

						<Controller
							control={control}
							name="amount"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input variant="outline" size="sm">
									<InputField
										placeholder="000000"
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

					{/* Puntos a otorgar */}
					<Text className="text-primary-600 text-base font-semibold">
						Puntos a otorgar: {pointsToEarn}
					</Text>

					{/* Campo de notas opcionales */}
					<FormControl isInvalid={!!errors.notes}>
						<FormControlLabel>
							<FormControlLabelText>Notas (opcional)</FormControlLabelText>
						</FormControlLabel>

						<Controller
							control={control}
							name="notes"
							render={({ field: { onChange, onBlur, value } }) => (
								<Input variant="outline" size="sm">
									<InputField
										placeholder="Ej: Compra en efectivo, factura #123..."
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
										multiline
										numberOfLines={4}
										textAlignVertical="top"
									/>
								</Input>
							)}
						/>

						{errors.notes && (
							<FormControlError>
								<FormControlErrorText>
									{errors.notes.message}
								</FormControlErrorText>
							</FormControlError>
						)}
					</FormControl>
				</VStack>

				{/* Botones de acción */}
				<VStack space="sm" className="w-full">
					<Button
						variant="solid"
						action="primary"
						size="md"
						isDisabled={loading}
						onPress={handleSubmit(onSubmit)}
					>
						<ButtonText>
							{loading ? "Procesando..." : "Registrar puntos"}
						</ButtonText>
					</Button>

					<Button
						variant="outline"
						action="secondary"
						size="md"
						onPress={() => router.back()}
					>
						<ButtonText>Cancelar</ButtonText>
					</Button>
				</VStack>
			</VStack>
		</AppLayout>
	);
}

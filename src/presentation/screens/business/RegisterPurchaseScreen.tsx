import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { supabase } from "@/src/infrastructure/services/supabase";
import { ErrorOverlay } from "@/src/presentation/components/feedback/ErrorOverlay";
import { SuccessOverlay } from "@/src/presentation/components/feedback/SuccessOverlay";
import { useScan } from "@/src/presentation/hooks/useScan";

const schema = z.object({
	purchaseAmount: z.number().min(1, "El monto debe ser mayor a 0"),
});

export function RegisterPurchaseScreen() {
	const { customerId } = useLocalSearchParams<{ customerId: string }>();
	const [customerName, setCustomerName] = useState<string | null>(null);
	const [fetching, setFetching] = useState(false);
	const [purchaseAmount, setPurchaseAmount] = useState<string>("");
	const [validationError, setValidationError] = useState<string>("");
	const [businessId, setBusinessId] = useState<string | null>(null);
	const [loadingBusiness, setLoadingBusiness] = useState(true);
	const { loading, success, error, process, reset } = useScan();

	// Obtener el business_id del usuario autenticado
	useEffect(() => {
		async function fetchBusinessId() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) {
					setValidationError("No hay usuario autenticado");
					setLoadingBusiness(false);
					return;
				}

				const { data, error } = await supabase
					.from("businesses")
					.select("id")
					.eq("owner_id", user.id)
					.single();

				if (error || !data) {
					setValidationError("No se encontró el negocio del usuario");
					setLoadingBusiness(false);
					return;
				}

				setBusinessId(data.id);
			} catch {
				setValidationError("Error al obtener información del negocio");
			} finally {
				setLoadingBusiness(false);
			}
		}

		fetchBusinessId();
	}, []);

	useEffect(() => {
		// Fetch del perfil del cliente desde la tabla profiles
		async function fetchCustomer() {
			setFetching(true);
			try {
				const { data, error } = await supabase
					.from("profiles")
					.select("first_name, last_name, second_last_name, role")
					.eq("id", customerId)
					.single();

				if (error || !data) {
					setCustomerName(null);
					return;
				}

				// Validar que sea un customer
				if (data.role !== "customer") {
					setCustomerName(null);
					return;
				}

				// Construir el nombre completo
				const fullName = [
					data.first_name,
					data.last_name,
					data.second_last_name,
				]
					.filter(Boolean)
					.join(" ");

				setCustomerName(fullName || "Sin nombre");
			} catch {
				setCustomerName(null);
			} finally {
				setFetching(false);
			}
		}
		if (customerId) fetchCustomer();
	}, [customerId]);

	const handleSubmit = () => {
		if (!businessId) {
			setValidationError("No se pudo obtener el ID del negocio");
			return;
		}

		setValidationError("");
		const amount = Number(purchaseAmount);

		// Validación con Zod
		const result = schema.safeParse({ purchaseAmount: amount });

		if (!result.success) {
			setValidationError(
				result.error.issues[0]?.message || "Error de validación",
			);
			return;
		}

		process(customerId as string, businessId, amount);
	};

	return (
		<Box className="flex-1 items-center justify-center bg-white px-8 gap-4 py-6">
			<Heading size="xl">Registrar compra</Heading>

			{loadingBusiness ? (
				<Text className="text-center">Cargando información del negocio...</Text>
			) : !businessId ? (
				<Box className="w-full bg-red-100 p-4 rounded-lg">
					<Text className="text-red-700 text-center font-bold">
						Error: No se encontró el negocio
					</Text>
					<Text className="text-red-600 text-center text-sm mt-2">
						Asegúrate de estar autenticado como dueño de negocio
					</Text>
				</Box>
			) : (
				<>
					<Text className="text-center mb-2">
						{fetching
							? "Cargando cliente..."
							: customerName
								? `Cliente: ${customerName}`
								: "Cliente no encontrado"}
					</Text>
					<Box className="w-full flex flex-col gap-4">
						<Input>
							<InputField
								placeholder="Monto de la compra"
								keyboardType="numeric"
								value={purchaseAmount}
								onChangeText={setPurchaseAmount}
							/>
						</Input>
						{validationError && (
							<Text className="text-red-500">{validationError}</Text>
						)}
						<Button
							variant="solid"
							action="primary"
							isDisabled={loading}
							onPress={handleSubmit}
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

// Hook para obtener información del cliente (customer) usando TanStack Query

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/src/infrastructure/services/supabase";

interface CustomerProfile {
	fullName: string;
	isValid: boolean;
}

async function fetchCustomerProfile(
	customerId: string,
): Promise<CustomerProfile> {
	const { data, error } = await supabase
		.from("profiles")
		.select("first_name, last_name, second_last_name, role")
		.eq("id", customerId)
		.maybeSingle();

	if (error) {
		console.error("useCustomerProfile: Error fetching profile", {
			message: error.message,
			code: error.code,
		});
		throw new Error("No se pudo obtener el perfil del cliente");
	}

	if (!data) {
		throw new Error("Cliente no encontrado");
	}

	// Validar que sea un customer
	if (data.role !== "customer") {
		console.warn("useCustomerProfile: Invalid role", data.role);
		return {
			fullName: "",
			isValid: false,
		};
	}

	// Construir el nombre completo
	const fullName = [data.first_name, data.last_name, data.second_last_name]
		.filter(Boolean)
		.join(" ");

	return {
		fullName: fullName || "Sin nombre",
		isValid: true,
	};
}

export function useCustomerProfile(customerId: string | undefined) {
	return useQuery({
		queryKey: ["customerProfile", customerId],
		queryFn: () => fetchCustomerProfile(customerId as string),
		enabled: !!customerId, // Solo ejecutar si hay customerId
		staleTime: 1000 * 60 * 5, // 5 minutos
		retry: 1,
	});
}

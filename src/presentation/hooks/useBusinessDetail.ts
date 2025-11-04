import { useQuery } from "@tanstack/react-query";
import type { Business } from "@/src/core/entities/Business";
import type { CustomerLoyaltyCard } from "@/src/core/entities/Loyalty";
import { supabase } from "@/src/infrastructure/services/supabase";
import { useAuthStore } from "@/src/presentation/stores/authStore";

interface BusinessDetailData {
	business: Business;
	loyaltyCard: CustomerLoyaltyCard | null;
}

async function fetchBusinessDetail(
	businessId: string,
	customerId: string,
): Promise<BusinessDetailData> {
	console.log("[useBusinessDetail] Buscando negocio:", businessId);
	console.log("[useBusinessDetail] Para cliente:", customerId);

	// 1. Obtener datos del negocio
	const { data: businessData, error: businessError } = await supabase
		.from("businesses")
		.select("*")
		.eq("id", businessId)
		.single();

	if (businessError) {
		console.error(
			"[useBusinessDetail] Error obteniendo negocio:",
			businessError,
		);
		throw new Error(`Error al obtener negocio: ${businessError.message}`);
	}

	console.log("[useBusinessDetail] Negocio encontrado:", businessData.name);

	// 2. Obtener la loyalty card del cliente para este negocio
	const { data: loyaltyData, error: loyaltyError } = await supabase.rpc(
		"get_customer_loyalty_summary",
		{
			p_customer_id: customerId,
		},
	);

	if (loyaltyError) {
		console.error(
			"[useBusinessDetail] Error obteniendo loyalty card:",
			loyaltyError,
		);
		// No lanzamos error aquí, simplemente no tendrá loyalty card
	}

	console.log("[useBusinessDetail] Loyalty data:", loyaltyData);

	// Buscar la loyalty card específica de este negocio
	const loyaltyCard =
		loyaltyData?.find(
			(card: {
				business_id: string;
				card_id: number;
				points: number;
				business_name: string;
				business_logo_url: string | null;
				next_reward_points: number | null;
				next_reward_name: string | null;
			}) => card.business_id === businessId,
		) || null;

	// Transformar datos del negocio
	const business: Business = {
		id: businessData.id,
		createdAt: new Date(businessData.created_at),
		updatedAt: new Date(businessData.updated_at),
		ownerId: businessData.owner_id,
		name: businessData.name,
		locationAddress: businessData.location_address,
		openingHours: businessData.opening_hours,
		logoUrl: businessData.logo_url,
	};

	// Transformar loyalty card si existe
	const transformedLoyaltyCard: CustomerLoyaltyCard | null = loyaltyCard
		? {
				cardId: loyaltyCard.card_id,
				points: Number(loyaltyCard.points),
				businessId: loyaltyCard.business_id,
				businessName: loyaltyCard.business_name,
				businessLogoUrl: loyaltyCard.business_logo_url,
				nextRewardPoints: loyaltyCard.next_reward_points
					? Number(loyaltyCard.next_reward_points)
					: null,
				nextRewardName: loyaltyCard.next_reward_name,
			}
		: null;

	return {
		business,
		loyaltyCard: transformedLoyaltyCard,
	};
}

export function useBusinessDetail(businessId: string | undefined) {
	const user = useAuthStore((state) => state.user);
	const customerId = user?.id;

	console.log("[useBusinessDetail] Hook ejecutado con:", {
		businessId,
		customerId,
	});

	return useQuery({
		queryKey: ["businessDetail", businessId, customerId],
		queryFn: () => {
			console.log("[useBusinessDetail] QueryFn ejecutándose...");
			if (!businessId || !customerId) {
				console.error("[useBusinessDetail] Falta businessId o customerId");
				throw new Error("Business ID o Customer ID no disponible");
			}
			return fetchBusinessDetail(businessId, customerId);
		},
		enabled: !!businessId && !!customerId,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
}

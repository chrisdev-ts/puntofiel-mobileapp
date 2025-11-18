import { useLocalSearchParams, useRouter } from "expo-router";
import { Gift, HelpCircle } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable } from "react-native";

// UI Components
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import {
	Modal,
	ModalBackdrop,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

// Shared Components
import { FeedbackScreen } from "@/src/presentation/components/common";
import { RaffleCard } from "@/src/presentation/components/common/RaffleCard";
import { RafflesListSkeleton } from "@/src/presentation/components/common/skeletons/RafflesListSkeleton";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

// Hooks Reales
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { useCustomerRaffles } from "@/src/presentation/hooks/useCustomerRaffles";

export default function RafflesIndexScreen() {
	const router = useRouter();
	// Obtenemos el ID del negocio desde la navegación anterior
	const { id: businessIdParam } = useLocalSearchParams<{ id: string }>();
	const [showInfoModal, setShowInfoModal] = useState(false);

	const { user } = useAuth();

	// 1. CONEXIÓN REAL A LA BD
	// Trae las rifas reales creadas por el dueño de este negocio
	const { raffles, isLoading: isLoadingRaffles } = useCustomerRaffles();

	// 2. Procesar datos reales para la vista
	const processedRaffles = useMemo(() => {
		if (!raffles) return [];

		const now = new Date();

		return raffles.map(raffle => {
			const start = new Date(raffle.startDate);
			const end = new Date(raffle.endDate);

			// Variables visuales por defecto
			let statusType: 'active' | 'finished' | 'upcoming';
			let badgeText = "";
			let badgeVariant: 'active' | 'inactive' = 'inactive';
			let statusIcon: 'won' | 'participating' | 'not_participating' = 'not_participating';

			// --- A. Lógica de Tiempo (Real) ---
			if (raffle.isCompleted || now > end) {
				// FINALIZADA
				statusType = 'finished';
				badgeText = "Finalizada";
				badgeVariant = 'inactive'; // Gris
			} else if (now < start) {
				// FUTURA
				statusType = 'upcoming';
				const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
				badgeText = `Empieza en ${diffDays} días`;
				badgeVariant = 'inactive'; // Gris
			} else {
				// VIGENTE
				statusType = 'active';
				const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
				badgeText = `Termina en ${diffDays} días`;
				badgeVariant = 'active'; // Azul
			}

			// --- B. Lógica de Usuario (Real) ---
			if (raffle.winnerCustomerId === user?.id) {
				statusIcon = 'won'; // 🏆 Ganó (Esto viene directo de la BD)
			}
			// Nota: Para el check verde de "participating", necesitamos consultar la tabla raffle_tickets.
			// Por ahora se mostrará como 'not_participating' (X o Gris) hasta que el usuario gane.

			return {
				...raffle,
				statusType,
				badgeText,
				badgeVariant,
				statusIcon
			};
		}).sort((a, b) => {
			// ORDENAMIENTO: 1. Activas -> 2. Finalizadas -> 3. Futuras
			const priority = { active: 1, finished: 2, upcoming: 3 };
			return priority[a.statusType] - priority[b.statusType];
		});
	}, [raffles, user?.id]);

	// Skeleton de carga real
	if (isLoadingRaffles) {
		return (
			<AppLayout showHeader={true} headerVariant="back" showNavBar={true}>
				<RafflesListSkeleton />
			</AppLayout>
		);
	}

	const hasRaffles = processedRaffles.length > 0;

	return (
		<AppLayout showHeader={true} headerVariant="back" headerTitle="" showNavBar={true} scrollable={true}>

			{/* Header */}
			<HStack className="justify-between items-center mb-6 mt-2 px-1">
				<Heading size="xl" className="text-[#2F4858]">Rifas anuales</Heading>
				<Pressable onPress={() => setShowInfoModal(true)} className="p-2">
					<HelpCircle size={24} color="#2F4858" />
				</Pressable>
			</HStack>

			{/* Estado Vacío */}
			{!hasRaffles && (
				<FeedbackScreen
					variant="empty"
					icon={Gift}
					title="¡No hay rifas activas!"
					description="Este negocio aún no cuenta con rifas activas. Vuelve a revisar pronto."
				/>
			)}

			{/* Lista de Rifas Reales */}
			{hasRaffles && (
				<Box className="px-4 pb-8">
					<Box className="border border-gray-300 rounded-2xl p-4 bg-white">

						{processedRaffles.map((raffle) => (
							<RaffleCard
								key={raffle.id}
								id={raffle.id}
								imageUrl={raffle.imageUrl}
								imageAlt={raffle.name}
								title={raffle.name}

								// Props calculados dinámicamente
								badgeText={raffle.badgeText}
								badgeVariant={raffle.badgeVariant}
								status={raffle.statusIcon}

								onPress={(id) => router.push(`/(customer)/business/raffles/${id}` as never)}
							/>
						))}

						{/* Pie de página de la lista */}
						<VStack className="mt-6 mb-4 items-center px-4">
							<Text className="text-center font-bold text-gray-600 mb-2 text-base">
								¡Has visto todas las rifas por ahora!
							</Text>
							<Text className="text-center text-gray-500 text-sm leading-6">
								Están son las rifas activas de tus negocios vinculados. Vuelve a revisar pronto; tu próxima gran oportunidad podría aparecer en cualquier momento.
							</Text>
						</VStack>

					</Box>
				</Box>
			)}

			{/* Modal Popup */}
			<Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} size="md">
				<ModalBackdrop />
				<ModalContent>
					<ModalHeader>
						<Heading size="lg" className="text-[#2F4858]">Información</Heading>
					</ModalHeader>
					<ModalBody>
						<Text className="mb-4 text-gray-600">
							Las rifas anuales son grandes sorteos organizados por tus negocios favoritos para premiar a sus clientes más leales.
						</Text>
						<Text className="mb-2 font-bold text-[#2F4858]">¿Cómo participo?</Text>
						<Text className="mb-4 text-gray-600">
							Puedes comprar uno o más boletos usando tus puntos acumulados. ¡Mientras más boletos, más oportunidades!
						</Text>
						<Text className="mb-2 font-bold text-[#2F4858]">Cláusula Importante:</Text>
						<Text className="text-gray-600">
							Los puntos gastados en la compra de boletos son permanentes. Si no resultas ganador, los puntos no serán devueltos a tu monedero.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button onPress={() => setShowInfoModal(false)} className="bg-[#2F4858] w-full rounded-lg">
							<ButtonText>Entendido</ButtonText>
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</AppLayout>
	);
}
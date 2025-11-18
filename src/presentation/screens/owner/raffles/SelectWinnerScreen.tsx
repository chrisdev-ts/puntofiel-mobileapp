import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useRaffleParticipants, useSelectWinner } from "@/src/presentation/hooks/useRaffleWinner";
import { Spinner } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TagIcon, Trophy } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet } from "react-native"; // Importa StyleSheet

// --- Constantes de Diseño y Animación ---
const CARD_WIDTH = 144;
const CARD_MARGIN_X = 8; // mx-1 -> 4px a cada lado, 8 total
const CARD_SIZE = CARD_WIDTH + CARD_MARGIN_X;
const { width: viewportWidth } = Dimensions.get('window');
const CENTER_OFFSET = viewportWidth / 2 - (CARD_SIZE / 2);

// --- Componente Auxiliar para la Tarjeta de Participante ---
const ParticipantCard = ({ participant, ticketsCountMap }: { participant: any, ticketsCountMap: Record<string, number> }) => {
    const customerId = participant.customer.id;
    const count = ticketsCountMap[customerId] || 0;

    return (
        <Box
            style={{ width: CARD_WIDTH }}
            className={`h-36 mx-1 p-3 rounded-xl border-2 border-gray-200 bg-white items-center justify-center shadow-sm`}
        >
            <Heading size="sm" className="text-center mb-1" numberOfLines={1}>
                {participant.customer.firstName} {participant.customer.lastName}
            </Heading>
            <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>
                Total de boletos canjeados:
            </Text>

            <Box className="bg-[#2F4858] px-2 py-1 rounded-full flex-row items-center">
                <Icon as={TagIcon} size="xs" className="text-white mr-1" />
                <Text className="text-white font-bold text-xs">{count}</Text>
            </Box>
        </Box>
    );
};


export default function SelectWinnerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const { data: participants = [], isLoading } = useRaffleParticipants(id);
    const { mutate: confirmWinner, isPending: isConfirming } = useSelectWinner();

    const [winner, setWinner] = useState<any>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const ticketsCountMap = useMemo(() => {
        return participants.reduce((acc, ticket) => {
            const customerId = ticket.customer.id;
            acc[customerId] = (acc[customerId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [participants]);


    const startRoulette = () => {
        if (participants.length === 0 || isSpinning) return;
        setIsSpinning(true);
        setWinner(null);

        const numParticipants = participants.length;
        if (numParticipants === 0) return;

        // 1. PRE-SELECCIÓN DEL GANADOR
        const finalIndex = Math.floor(Math.random() * numParticipants);
        const finalWinner = participants[finalIndex];

        // 2. CÁLCULO DE LA POSICIÓN DE PARADA
        // Usaremos 50 repeticiones para un giro que parece infinito
        const numRepetitions = 50;
        const targetBandIndex = Math.floor(numRepetitions / 2); // Aterrizar en una banda central

        const winnerIndexInExtendedList = targetBandIndex * numParticipants + finalIndex;
        const targetScrollPosition = (winnerIndexInExtendedList * CARD_SIZE) - CENTER_OFFSET;

        // 3. ANIMACIÓN DE SCROLL
        const totalDuration = 7000;
        const startTime = Date.now();

        // 🔥 GIRO A LA DERECHA: Empezamos en una posición muy a la izquierda y avanzamos
        // Calculamos un punto de inicio aleatorio dentro de la primera banda de repeticiones
        const initialScrollOffset = Math.random() * numParticipants * CARD_SIZE;

        // La distancia total es desde donde empezamos hasta donde queremos llegar
        const totalDisplacement = targetScrollPosition - initialScrollOffset;

        let currentScroll = initialScrollOffset;

        scrollRef.current?.scrollTo({ x: currentScroll, y: 0, animated: false });


        const runStep = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = elapsedTime / totalDuration;

            if (progress < 1) {
                const easedProgress = 1 - Math.pow(1 - progress, 5); // Ease-out Quintic

                // 🔥 Fórmula de scroll a la derecha (incrementa el valor de X)
                currentScroll = initialScrollOffset + (easedProgress * totalDisplacement);

                scrollRef.current?.scrollTo({ x: currentScroll, y: 0, animated: false });

                timerRef.current = setTimeout(runStep, 16);
            } else {
                // FIN: Aseguramos la posición final
                scrollRef.current?.scrollTo({ x: targetScrollPosition, y: 0, animated: true });

                setIsSpinning(false);
                setWinner(finalWinner);
            }
        };

        runStep();
    };

    const handleConfirm = () => {
        if (!winner) return;
        confirmWinner(
            { raffleId: id, customerId: winner.customer.id },
            {
                onSuccess: () => {
                    router.back();
                }
            }
        );
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (isLoading) return <Box className="flex-1 bg-white justify-center items-center"><Spinner color="#2F4858" /></Box>;

    return (
        <AppLayout showHeader={true} showNavBar={false} headerVariant="back" headerTitle="Seleccionar ganador">
            <VStack className="flex-1 p-4 justify-between pb-10">

                {/* Encabezado */}
                <VStack space="sm" className="items-center mt-4 mb-8">
                    <Heading size="xl" className="text-[#2F4858] text-center">
                        {winner ? "Ganador" : "Sorteo de rifa anual"}
                    </Heading>
                    <Text className="text-gray-500 text-center px-4">
                        {winner
                            ? `¡Felicidades, ${winner.customer.firstName}! Confirma para cerrar la rifa.`
                            : "Presiona el botón para iniciar la ruleta aleatoria."}
                    </Text>
                </VStack>

                {/* ÁREA VISUAL DE LA RULETA */}
                <Box className="flex-1 justify-center items-center">
                    {participants.length === 0 ? (
                        <Text className="text-gray-400">No hay participantes para sortear.</Text>
                    ) : (
                        <VStack className="items-center w-full">

                            {/* 1. Flecha Indicadora y Nombre del Ganador/Giro */}
                            <VStack className="absolute z-10 top-[-25] items-center" style={{ width: '100%' }}>
                                <Text className="text-4xl text-[#2F4858]">▼</Text>

                                {winner && (
                                    <VStack className="items-center mt-6">
                                        <Icon as={Trophy} size="xl" color="rgb(234, 179, 8)" />
                                        <Heading size="xl" className="text-[#2F4858] font-extrabold mt-2 text-center">
                                            {`${winner.customer.firstName} ${winner.customer.lastName}`}
                                        </Heading>
                                    </VStack>
                                )}
                                {!winner && isSpinning && (
                                    <Heading size="lg" className="text-[#2F4858] font-bold mt-6">
                                        Girando...
                                    </Heading>
                                )}
                            </VStack>

                            {/* 2. Banda Horizontal Deslizable O Tarjeta de Ganador Fija */}
                            {!winner ? ( // 🔥 Mostrar ScrollView SÓLO si no hay ganador final
                                <ScrollView
                                    horizontal={true}
                                    showsHorizontalScrollIndicator={false}
                                    scrollEnabled={false}
                                    ref={scrollRef}
                                    contentContainerStyle={{ paddingHorizontal: CENTER_OFFSET, alignItems: 'center' }}
                                    className="w-full h-40 mt-16"
                                >
                                    {/* 🔥 50 repeticiones para el efecto de giro infinito */}
                                    {Array(50).fill(0).flatMap(() => participants).map((participant, index) => (
                                        <ParticipantCard
                                            key={`${participant.id}-${index}`} // Clave única para cada instancia de la tarjeta
                                            participant={participant}
                                            ticketsCountMap={ticketsCountMap}
                                        />
                                    ))}
                                </ScrollView>
                            ) : ( // Mostrar info simple del ganador (sin repetir nombre)
                                <VStack className="w-full h-40 mt-16 justify-center items-center">
                                    <Text className="text-gray-500 text-center">Total de boletos canjeados</Text>

                                    <Box className="bg-[#2F4858] px-3 py-1 rounded-full mt-2 flex-row items-center">
                                        <Icon as={TagIcon} size="xs" className="text-white mr-2" />
                                        <Text className="text-white font-bold">{ticketsCountMap[winner.customer.id] ?? 0}</Text>
                                    </Box>
                                </VStack>
                            )}

                            {/* 3. Base Inferior */}
                            <Box className="w-64 h-2 bg-gray-200 rounded-full mt-[-20] mb-10" />
                        </VStack>
                    )}
                </Box>
                {/* FIN ÁREA VISUAL DE LA RULETA */}


                {/* Botones */}
                <Box>
                    {!winner ? (
                        <Button
                            onPress={startRoulette}
                            isDisabled={isSpinning || participants.length === 0}
                            className="bg-[#2F4858] rounded-lg h-12"
                        >
                            <ButtonText>{isSpinning ? "Girando..." : "Empezar ruleta"}</ButtonText>
                        </Button>
                    ) : (
                        <VStack space="md">
                            <Button onPress={handleConfirm} isDisabled={isConfirming} className="bg-[#2F4858] rounded-lg h-12">
                                <ButtonText>{isConfirming ? <Spinner color="white" /> : "Confirmar"}</ButtonText>
                            </Button>
                            <Button variant="outline" onPress={() => setWinner(null)} className="border-[#2F4858] rounded-lg h-12">
                                <ButtonText className="text-[#2F4858]">Volver a girar</ButtonText>
                            </Button>
                        </VStack>
                    )}
                </Box>
            </VStack>
        </AppLayout>
    );
}

// Estilos para evitar recortes si el nombre del cliente es muy largo
const styles = StyleSheet.create({
    textContainer: {
        width: CARD_WIDTH - (CARD_MARGIN_X * 2), // Ancho de la tarjeta menos padding/margin
    }
});
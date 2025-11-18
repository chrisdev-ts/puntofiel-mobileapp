import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useRaffleParticipants, useSelectWinner } from "@/src/presentation/hooks/useRaffleWinner";
import { Spinner } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TagIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";

export default function SelectWinnerScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    // Datos y Mutación
    const { data: participants = [], isLoading } = useRaffleParticipants(id);
    const { mutate: confirmWinner, isPending: isConfirming } = useSelectWinner();

    // Estados para la animación
    const [winner, setWinner] = useState<any>(null); // El ganador final
    const [displayIndex, setDisplayIndex] = useState(0); // Índice visual actual (el que gira)
    const [isSpinning, setIsSpinning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Función de "Giro"
    const startRoulette = () => {
        if (participants.length === 0) return;
        setIsSpinning(true);
        setWinner(null);

        let speed = 50; // Velocidad inicial (ms)
        let steps = 0;
        const totalSteps = 30 + Math.floor(Math.random() * 10); // Pasos aleatorios (entre 30 y 40)

        const runStep = () => {
            // Cambiar al siguiente participante (circular)
            setDisplayIndex((prev) => (prev + 1) % participants.length);
            steps++;

            if (steps < totalSteps) {
                // Efecto desaceleración: aumentar el tiempo entre pasos
                if (steps > totalSteps - 10) speed += 30;
                if (steps > totalSteps - 5) speed += 60;

                timerRef.current = setTimeout(runStep, speed);
            } else {
                // FIN: Seleccionar ganador final
                const finalIndex = (displayIndex + 1) % participants.length; // El que quedó
                setWinner(participants[finalIndex]);
                setIsSpinning(false);
            }
        };

        runStep();
    };

    // Guardar en BD
    const handleConfirm = () => {
        if (!winner) return;
        confirmWinner(
            { raffleId: id, customerId: winner.customer.id },
            {
                onSuccess: () => {
                    router.back(); // Volver al detalle que ahora mostrará al ganador
                }
            }
        );
    };

    // Limpiar timers
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (isLoading) return <Box className="flex-1 bg-white center"><Spinner color="#2F4858" /></Box>;

    // Usuario que se muestra actualmente (mientras gira o el ganador)
    const currentUser = participants[displayIndex];

    return (
        <AppLayout showHeader={true} showNavBar={false} headerVariant="back" headerTitle="Seleccionar ganador">
            <VStack className="flex-1 p-4 justify-between pb-10">

                {/* Encabezado */}
                <VStack space="sm" className="items-center mt-4">
                    <Heading size="xl" className="text-[#2F4858] text-center">
                        {winner ? "Ganador" : "Sorteo de rifa anual"}
                    </Heading>
                    <Text className="text-gray-500 text-center px-4">
                        {winner
                            ? `¡Felicidades a ${winner.customer.firstName}! Confirma para cerrar la rifa.`
                            : "Presiona el botón para iniciar la ruleta aleatoria."}
                    </Text>
                </VStack>

                {/* Área Visual de la Ruleta (Card Central) */}
                <Center>
                    {participants.length === 0 ? (
                        <Text className="text-gray-400">No hay participantes para sortear.</Text>
                    ) : (
                        <VStack className="items-center">
                            {/* Flechita indicadora */}
                            <Text className="text-3xl text-[#2F4858] mb-2">▼</Text>

                            <Box className={`w-64 p-6 rounded-xl border-2 ${winner ? 'border-[#2F4858] bg-blue-50' : 'border-gray-200 bg-white'} items-center shadow-sm`}>
                                <Heading size="lg" className="text-center mb-2">
                                    {currentUser?.customer.firstName}
                                </Heading>
                                <Text className="text-gray-500 mb-4">{currentUser?.customer.lastName}</Text>

                                <Box className="bg-[#2F4858] px-3 py-1 rounded-full flex-row items-center">
                                    <Icon as={TagIcon} size="xs" className="text-white mr-2" />
                                    <Text className="text-white font-bold text-xs">Ticket #{currentUser?.id}</Text>
                                </Box>
                            </Box>

                            {/* Sombra/Base */}
                            <Box className="w-32 h-2 bg-gray-200 rounded-full mt-4" />
                        </VStack>
                    )}
                </Center>

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
                                {isConfirming ? <Spinner color="white" /> : <ButtonText>Confirmar</ButtonText>}
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
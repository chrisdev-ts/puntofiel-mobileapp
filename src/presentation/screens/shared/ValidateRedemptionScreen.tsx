import { Spinner } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { useEffect, useState } from "react";

// UI Components
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";

// Layout & Shared
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";

// Hooks
import { useReward } from "@/src/presentation/hooks/useReward";

export default function ValidateRedemptionScreen() {
    const { data } = useLocalSearchParams<{ data: string }>();
    const router = useRouter();
    const toast = useToast();

    const [qrInfo, setQrInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const { redeemReward, isRedeeming } = useReward(undefined);

    useEffect(() => {
        try {
            const parsed = JSON.parse(decodeURIComponent(data));

            const qrTime = new Date(parsed.timestamp).getTime();
            if (Date.now() - qrTime > 30 * 60 * 1000) {
                setError("El código QR ha expirado.");
                return;
            }
            setQrInfo(parsed);
        } catch (e) {
            setError("Datos de QR inválidos o corruptos.");
        }
    }, [data]);

    const handleConfirm = async () => {
        if (!qrInfo) return;

        try {
            await redeemReward({
                rewardId: qrInfo.rewardId,
                userId: qrInfo.userId,
                cost: qrInfo.pointsCost
            });

            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="success" variant="solid">
                        <ToastTitle>¡Canje Exitoso!</ToastTitle>
                        <ToastDescription>Puntos descontados correctamente.</ToastDescription>
                    </Toast>
                ),
            });

            router.back();

        } catch (err: any) {
            toast.show({
                placement: "top",
                render: ({ id }) => (
                    <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                        <ToastTitle>Error en el canje</ToastTitle>
                        <ToastDescription>{err.message || "Saldo insuficiente o error de red"}</ToastDescription>
                    </Toast>
                ),
            });
        }
    };

    if (error) return <FeedbackScreen variant="error" icon={AlertCircleIcon} title="QR Inválido" description={error} />;
    if (!qrInfo) return <Box className="flex-1 bg-white center"><Spinner color="#2F4858" /></Box>;

    return (
        <AppLayout showHeader={true} headerVariant="back" headerTitle="Validar canje de recompensa" showNavBar={false}>
            <VStack space="lg" className="p-2 pt-6">

                {/* Encabezado con Nombres Dinámicos */}
                <VStack space="xs">
                    <Heading size="xl" className="text-[#2F4858] font-bold mb-1">
                        {qrInfo.rewardName || "Recompensa"}
                    </Heading>
                    {/* 👇 AQUÍ SE MUESTRA EL NOMBRE DEL NEGOCIO */}
                    <Heading size="md" className="text-gray-700">
                        Válida para {qrInfo.businessName || "este negocio"}
                    </Heading>
                </VStack>

                {/* Resumen de Puntos */}
                <Box className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Text className="text-gray-800 font-bold text-lg mb-1">Puntos a descontar: {qrInfo.pointsCost}</Text>
                    <Text className="text-gray-600 text-sm">Al confirmar, se restarán estos puntos del cliente permanentemente.</Text>
                    <Text className="text-gray-600 text-sm mt-2">Infórmele al cliente que se le descontarán {qrInfo.pointsCost} puntos antes de confirmar.</Text>
                </Box>

                {/* Instrucciones Dinámicas */}
                <Box className="mt-6">
                    <Heading size="md" className="text-[#2F4858] mb-4 font-bold">Instrucciones</Heading>

                    <VStack space="md">
                        <HStack space="sm">
                            <Text className="font-bold text-gray-700 mt-0.5">1.</Text>
                            <Text className="text-gray-600 flex-1 leading-5">
                                Confirma visualmente que la <Text className="font-bold">{qrInfo.rewardName}</Text> es el producto/servicio que se está entregando al cliente.
                            </Text>
                        </HStack>

                        <HStack space="sm">
                            <Text className="font-bold text-gray-700 mt-0.5">2.</Text>
                            <Text className="text-gray-600 flex-1 leading-5">
                                Dirígete a la caja (TPV) y registra el producto. Aplica el descuento o marca el producto como $0.00 según el procedimiento del local.
                            </Text>
                        </HStack>

                        <HStack space="sm">
                            <Text className="font-bold text-gray-700 mt-0.5">3.</Text>
                            <Text className="text-gray-600 flex-1 leading-5">
                                Entrega el producto/recompensa al cliente junto con su recibo de caja.
                            </Text>
                        </HStack>

                        <HStack space="sm">
                            <Text className="font-bold text-gray-700 mt-0.5">4.</Text>
                            <Text className="text-gray-600 flex-1 leading-5">
                                Una vez entregado, presiona "Confirmar Entrega" para realizar el descuento pertinente de los puntos al usuario. ¡La transacción ha terminado!
                            </Text>
                        </HStack>
                    </VStack>
                </Box>

                {/* Botones de Acción */}
                <HStack space="md" className="mt-8 pb-8">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 border-gray-300 rounded-lg"
                        onPress={() => router.back()}
                        isDisabled={isRedeeming}
                    >
                        <ButtonText className="text-gray-600 font-medium">Cancelar ✕</ButtonText>
                    </Button>

                    <Button
                        className="bg-[#2F4858] flex-1 h-12 rounded-lg"
                        onPress={handleConfirm}
                        isDisabled={isRedeeming}
                    >
                        {isRedeeming ? <Spinner color="white" /> : <ButtonText className="font-medium">Confirmar ✓</ButtonText>}
                    </Button>
                </HStack>

            </VStack>
        </AppLayout>
    );
}
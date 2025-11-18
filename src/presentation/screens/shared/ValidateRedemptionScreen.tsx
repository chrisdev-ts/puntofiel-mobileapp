import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { FeedbackScreen } from "@/src/presentation/components/common";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useReward } from "@/src/presentation/hooks/useReward";
import { Spinner } from "@gluestack-ui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { useEffect, useState } from "react";

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
            setError("Datos de QR inválidos.");
        }
    }, [data]);

    const handleConfirm = async () => {
        if (!qrInfo) return;

        try {
            // 👇 AQUÍ SE RESTAN LOS PUNTOS
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
                        <ToastDescription>Puntos descontados al cliente.</ToastDescription>
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
                        <ToastDescription>{err.message || "No tiene saldo suficiente"}</ToastDescription>
                    </Toast>
                ),
            });
        }
    };

    if (error) return <FeedbackScreen variant="error" icon={AlertCircleIcon} title="QR Inválido" description={error} />;
    if (!qrInfo) return <Box className="flex-1 bg-white center"><Spinner color="#2F4858" /></Box>;

    return (
        <AppLayout showHeader={true} headerVariant="back" headerTitle="Validar canje" showNavBar={false}>
            <VStack space="lg" className="p-4">
                <Heading size="xl" className="text-[#2F4858]">{qrInfo.rewardName || "Recompensa"}</Heading>
                <Box className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <Text className="text-gray-800 font-bold text-lg mb-1">Puntos a descontar: {qrInfo.pointsCost}</Text>
                    <Text className="text-gray-600 text-sm">Al confirmar, se restarán estos puntos del cliente permanentemente.</Text>
                </Box>
                {/* ... Instrucciones (igual que antes) ... */}
                <HStack space="md" className="mt-8">
                    <Button variant="outline" className="flex-1" onPress={() => router.back()} isDisabled={isRedeeming}><ButtonText>Cancelar</ButtonText></Button>
                    <Button className="bg-[#2F4858] flex-1" onPress={handleConfirm} isDisabled={isRedeeming}>
                        {isRedeeming ? <Spinner color="white" /> : <ButtonText>Confirmar Entrega</ButtonText>}
                    </Button>
                </HStack>
            </VStack>
        </AppLayout>
    );
}